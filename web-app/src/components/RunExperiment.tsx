import { useState, useEffect, useCallback, useRef } from "react";
import { WellPlate } from "./WellPlate";
import { ActionLog } from "./ActionLog";
// import { ExperimentControls } from "./ExperimentControls";
import { useExperimentStore } from "../stores/experimentStore";
import { useEquipmentStore } from "../stores/equipmentStore";
import { cn } from "../lib/utils";
import { v4 as uuidv4 } from "uuid";
import { equipmentCosts } from "@/lib/costs";
import {
  startExperiment,
  cancelExperiment,
  getExperimentActionLog,
  getExperimentStatus,
} from "@/lib/experimentApi";

interface LogEntry {
  timestamp: Date;
  type: "place_droplets" | "get_color";
  position: { x: number; y: number };
  drops?: [number, number, number];
  color?: string;
  status?: "cancelled";
}

export function RunExperiment({ onBack }: { onBack: () => void }) {
  const calculateExperimentCost = useCallback((elapsedSeconds: number, selectedEquipment: string[]) => {
    let totalCost = 0;
    
    // Add setup costs for each piece of equipment
    selectedEquipment.forEach(equipmentType => {
      if (equipmentCosts[equipmentType]) {
        totalCost += equipmentCosts[equipmentType].setupCost;
        // Add time-based costs (convert seconds to minutes)
        totalCost += (equipmentCosts[equipmentType].perMinuteCost * (elapsedSeconds / 60));
      }
    });

    return totalCost.toFixed(2);
  }, []);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [actionLog, setActionLog] = useState<LogEntry[]>([]);
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [optimalCombo, setOptimalCombo] = useState<[number, number, number]>();

  const wells = useExperimentStore((state) => state.wells);
  const setWellColor = useExperimentStore((state) => state.setWellColor);
  const clearWells = useExperimentStore((state) => state.clearWells);
  const objective = useExperimentStore((state) => state.objective);
  const optimizer = useExperimentStore((state) => state.optimizer);
  const equipment = useEquipmentStore((state) => state.equipment);

  const getWellColorsFromLog = useCallback((logEntries: LogEntry[]) => {
    const wellColors: Record<string, string> = {};

    // Process log entries in chronological order to get latest color for each well
    logEntries.forEach((entry) => {
      if (entry.type === "get_color" && entry.color) {
        const wellKey = `${entry.position.x},${entry.position.y}`;
        wellColors[wellKey] = entry.color;
      }
    });

    return wellColors;
  }, []);

  // Update the wells whenever the action log changes
  useEffect(() => {
    const wellColors = getWellColorsFromLog(actionLog);

    // Update the wells in the experiment store using setWellColor
    Object.entries(wellColors).forEach(([key, color]) => {
      const [x, y] = key.split(",").map(Number);
      setWellColor(x, y, color); // Use store setter to update colors
    });
  }, [actionLog, getWellColorsFromLog, setWellColor]); // Include setWellColor in dependencies
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(
          Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const experimentIdRef = useRef<string | null>(null);

  useEffect(() => {
    experimentIdRef.current = experimentId;
  }, [experimentId]);

  const pollExperimentStatus = useCallback(async () => {
    const currentExperimentId = experimentIdRef.current;
    if (!currentExperimentId) {
      console.log("No experimentId available, skipping poll");
      return;
    }

    console.log("=== Starting Poll ===");
    console.log("Polling for experiment:", currentExperimentId);

    try {
      // First try to get status
      console.log("Fetching status...");
      const status = await getExperimentStatus(currentExperimentId);
      console.log("Status response:", status);

      // Then try to get log entries
      console.log("Fetching action log...");
      const logEntries = await getExperimentActionLog(currentExperimentId);
      console.log("Log entries response:", logEntries);

      if (!Array.isArray(logEntries)) {
        console.warn("Received non-array log entries:", logEntries);
        return;
      }

      const formattedLog: LogEntry[] = logEntries.map((entry) => ({
        timestamp: new Date(entry.timestamp * 1000),
        type: entry.type === "place" ? "place_droplets" : "get_color",
        position: { x: entry.data.x, y: entry.data.y },
        drops: entry.type === "place" ? entry.data.droplet_counts : undefined,
        color: entry.type === "read" ? entry.data.color : undefined,
      }));

      console.log("Setting formatted log:", formattedLog);
      setActionLog(formattedLog);

      // Check if experiment is complete
      if (status.status === "completed") {
        if (status.result?.optimal_combo) {
          setOptimalCombo(status.result.optimal_combo);
        }
        console.log("Experiment completed, stopping polling");
        
        // Stop polling - clear both the interval and the state
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        setPollingInterval(null);
        setIsRunning(false);
        setExperimentId(null);
        experimentIdRef.current = null;
        
        // Optional: Show completion message
        alert("Experiment completed successfully!");
        return; // Exit the polling function
      }

      console.log("=== Poll Complete ===");
    } catch (error) {
      console.error("=== Poll Error ===");
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      // If we get a 404 or similar, we might want to stop polling
      if (error.message.includes("404")) {
        console.log("Received 404, stopping poll");
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        setIsRunning(false);
        setExperimentId(null);
        experimentIdRef.current = null;
      }
    }
  }, [pollingInterval, setPollingInterval]); // Add setPollingInterval to dependencies

  const handleCancelExperiment = async () => {
    console.log("Cancel button clicked");
    if (confirm("Are you sure you want to cancel the experiment?")) {
      try {
        console.log("Sending cancel request");
        await cancelExperiment();
        console.log("Cancel request successful");

        // Clear polling interval
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }

        setIsRunning(false);
        setStartTime(null);
        setElapsedTime(0);
        setActionLog((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            type: "place_droplets",
            position: { x: 0, y: 0 },
            drops: undefined,
            status: "cancelled",
          },
        ]);
      } catch (error) {
        console.error("Failed to cancel experiment:", error);
        alert("Failed to cancel experiment. Please try again.");
      }
    }
  };

  const handleStartExperiment = async () => {
    try {
      // Clear the well plate state
      clearWells();
      
      const newExperimentId = uuidv4();
      console.log("=== Starting New Experiment ===");
      console.log("Generated ID:", newExperimentId);

      // Get the target color from the objective
      if (!objective?.color) {
        throw new Error("No target color specified");
      }

      // Get the configured step count from optimizer
      const maxSteps = optimizer?.steps || DEFAULT_MAX_STEPS;
      console.log("Using max steps:", maxSteps);

      // Set both state and ref
      setExperimentId(newExperimentId);
      experimentIdRef.current = newExperimentId;

      // Start the experiment with the target color and step count
      console.log("Calling startExperiment API...");
      const response = await startExperiment(
        newExperimentId,
        objective.color,
        maxSteps  // Pass the configured step count
      );
      console.log("Start experiment response:", response);

      // Update state
      setIsRunning(true);
      setStartTime(new Date());
      setActionLog([]);

      // Start polling
      console.log("Initializing polling...");
      await pollExperimentStatus(); // Initial poll

      console.log("Setting up polling interval...");
      const interval = setInterval(() => {
        console.log("Polling interval triggered");
        pollExperimentStatus();
      }, 1000);

      setPollingInterval(interval);
      console.log("Polling interval set:", interval);
    } catch (error) {
      console.error("Failed to start experiment:", error);
      alert("Failed to start experiment. Please try again.");
    }
  };

  // Cleanup effect for polling interval
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          disabled={isRunning}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            isRunning
              ? "bg-gray-100 text-gray-400"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          Back
        </button>

        <button
          onClick={() => {
            if (isRunning) {
              handleCancelExperiment();
            } else {
              handleStartExperiment();
            }
          }}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            isRunning
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-blue-600 text-white hover:bg-blue-700",
          )}
        >
          {isRunning ? "Cancel Experiment" : "Start Experiment"}
        </button>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        {/* Left column - Well plate */}
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
          <div className="w-full max-w-3xl aspect-[1.5/1]">
            <div className="transform rotate-90 lg:rotate-0 w-full h-full">
              <WellPlate
                wells={wells}
                onWellClick={(x, y) => console.log(`Clicked well: ${x},${y}`)}
              />
            </div>
          </div>
        </div>

        {/* Right column - Status Cards and Action Log */}
        <div className="h-full overflow-hidden flex flex-col">
          <div className="grid grid-cols-2 gap-4 p-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Time Elapsed</div>
              <div className="text-xl font-semibold">
                {new Date(elapsedTime * 1000).toISOString().substr(11, 8)}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Steps Completed</div>
              <div className="text-xl font-semibold">
                {actionLog.filter(entry => entry.type === "place_droplets").length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Optimal Combination</div>
              <div className="text-xl font-semibold">
                {optimalCombo ? `${optimalCombo.join(', ')}` : '-'}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Experiment Cost</div>
              <div className="text-xl font-semibold">
                £{calculateExperimentCost(elapsedTime, Object.keys(equipment))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ActionLog 
              entries={actionLog} 
              elapsedTime={elapsedTime}
              optimalCombo={optimalCombo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
