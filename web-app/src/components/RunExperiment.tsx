import { useState, useEffect } from 'react';
import { WellPlate } from './WellPlate';
import { ExperimentControls } from './ExperimentControls';
import { useExperimentStore } from '../stores/experimentStore';
import { useEquipmentStore } from '../stores/equipmentStore';
import { cn } from '../lib/utils';

interface LogEntry {
  timestamp: Date;
  type: 'place_droplets' | 'get_color';
  position: { x: number; y: number };
  drops?: [number, number, number];
  color?: string;
}

export function RunExperiment({ onBack }: { onBack: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [actionLog, setActionLog] = useState<LogEntry[]>([]);
  
  const wells = useExperimentStore((state) => state.wells);
  const activeWell = useExperimentStore((state) => state.activeWell);
  const objective = useExperimentStore((state) => state.objective);
  const optimizer = useExperimentStore((state) => state.optimizer);
  const equipment = useEquipmentStore((state) => state.equipment);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExperiment = () => {
    setIsRunning(true);
    setStartTime(new Date());
    setActionLog([
      {
        timestamp: new Date(),
        type: 'place_droplets',
        position: { x: 0, y: 0 },
        drops: [2, 1, 1]
      }
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Controls moved to top */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={onBack}
            disabled={isRunning}
            className={cn(
              "px-4 py-2 rounded-lg font-medium",
              isRunning
                ? "bg-gray-100 text-gray-400"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Back
          </button>
          <ExperimentControls />
        </div>
        
        <button
          onClick={handleStartExperiment}
          disabled={isRunning}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            isRunning
              ? "bg-gray-100 text-gray-400"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {isRunning ? 'Running...' : 'Start Experiment'}
        </button>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left column - Rotated well plate */}
        <div className="transform rotate-90 origin-top-left translate-y-full">
          <WellPlate
            wells={wells}
            activeWell={activeWell}
            onWellClick={(x, y) => console.log(`Clicked well: ${x},${y}`)}
          />
        </div>

        {/* Right column - Experiment info */}
        <div className="space-y-6">
          {/* Timer and Step Count */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-700">Time Elapsed</h4>
              <p className="text-2xl font-mono text-blue-600">
                {formatTime(elapsedTime)}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-700">Steps Completed</h4>
              <p className="text-2xl font-mono text-blue-600">
                {actionLog.length}
              </p>
            </div>
          </div>

          {/* Action Log */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h4 className="font-medium text-gray-700 mb-4">Action Log</h4>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {actionLog.map((entry, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="text-sm text-gray-500">
                    {entry.timestamp.toLocaleTimeString()}
                  </div>
                  {entry.type === 'place_droplets' ? (
                    <div>
                      <span className="font-medium">Place Droplets</span>
                      <span className="text-gray-600">
                        {` at Well (${entry.position.x}, ${entry.position.y})`}
                      </span>
                      <div className="text-sm text-gray-600">
                        Drops: A:{entry.drops?.[0]} B:{entry.drops?.[1]} C:{entry.drops?.[2]}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="font-medium">Get Color</span>
                      <span className="text-gray-600">
                        {` at Well (${entry.position.x}, ${entry.position.y})`}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-gray-600">{entry.color}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
