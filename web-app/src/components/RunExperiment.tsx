import { useState, useEffect, useCallback } from "react";
import { WellPlate } from "./WellPlate";
import { ActionLog } from "./ActionLog";
// import { ExperimentControls } from "./ExperimentControls";
import { useExperimentStore } from "../stores/experimentStore";
import { useEquipmentStore } from "../stores/equipmentStore";
import { cn } from "../lib/utils";
import { v4 as uuidv4 } from "uuid";
import {
  startExperiment,
  cancelExperiment,
  getExperimentActionLog,
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
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [actionLog, setActionLog] = useState<LogEntry[]>([]);
  const [experimentId, setExperimentId] = useState<string | null>(null);

  const wells = useExperimentStore((state) => state.wells);
  const setWellColor = useExperimentStore((state) => state.setWellColor);

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
  const objective = useExperimentStore((state) => state.objective);
  const optimizer = useExperimentStore((state) => state.optimizer);
  const equipment = useEquipmentStore((state) => state.equipment);

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

  const handleCancelExperiment = async () => {
    console.log("Cancel button clicked");
    if (confirm("Are you sure you want to cancel the experiment?")) {
      try {
        console.log("Sending cancel request");
        await cancelExperiment();
        console.log("Cancel request successful");
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
      const newExperimentId = uuidv4();
      setExperimentId(newExperimentId);
      await startExperiment(newExperimentId);
      setIsRunning(true);
      setStartTime(new Date());
      setActionLog([]); // Start with empty log instead of mock data
    } catch (error) {
      console.error("Failed to start experiment:", error);
      alert("Failed to start experiment. Please try again.");
    }
  };

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

        {experimentId && (
          <>
            <button
              onClick={async () => {
                try {
                  const logEntries = await getExperimentActionLog(experimentId);
                  console.log("Raw API response:", logEntries); // Debug log

                  // Guard against undefined/null response
                  if (!Array.isArray(logEntries)) {
                    console.error("Unexpected API response format:", logEntries);
                    return;
                  }

                  const formattedLog: LogEntry[] = logEntries.map((entry) => ({
                    timestamp: new Date(entry.timestamp * 1000),
                    type: entry.type === "place" ? "place_droplets" : "get_color",
                    position: { x: entry.data.x, y: entry.data.y },
                    drops:
                      entry.type === "place"
                        ? entry.data.droplet_counts
                        : undefined,
                    color: entry.type === "read" ? entry.data.color : undefined,
                  }));

                  console.log("Formatted log:", formattedLog); // Debug log
                  setActionLog(formattedLog);
                } catch (error) {
                  console.error("Failed to fetch action log:", error);
                  alert("Failed to fetch action log. Check console for details.");
                }
              }}
              className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              Debug: Fetch Log
            </button>
            <button
              onClick={async () => {
                try {
                  const status = await getExperimentStatus(experimentId);
                  console.log("Experiment status:", status);
                } catch (error) {
                  console.error("Failed to fetch experiment status:", error);
                  alert("Failed to fetch status. Check console for details.");
                }
              }}
              className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              Debug: Get Status
            </button>
          </>
        )}
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

        {/* Right column - Action Log */}
        <div className="h-full overflow-hidden">
          <ActionLog entries={actionLog} elapsedTime={elapsedTime} />
        </div>
      </div>
    </div>
  );
}
