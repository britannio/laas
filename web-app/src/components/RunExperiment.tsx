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
      },
      {
        timestamp: new Date(Date.now() + 1000), // 1 second later
        type: 'get_color',
        position: { x: 0, y: 0 },
        color: '#FF8844'
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
        {/* Left column - Responsive well plate */}
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
          <div className="w-full max-w-3xl aspect-[1.5/1]">
            <div className="transform rotate-90 lg:rotate-0 w-full h-full">
              <WellPlate
                wells={wells}
                activeWell={activeWell}
                onWellClick={(x, y) => console.log(`Clicked well: ${x},${y}`)}
              />
            </div>
          </div>
        </div>

        {/* Right column - Scrollable content */}
        <div className="flex flex-col gap-4 min-h-0">
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
          <div className="bg-white rounded-lg shadow-sm p-4 flex-grow min-h-0">
            <h4 className="font-medium text-gray-700 mb-4">Action Log</h4>
            <div className="space-y-3 overflow-y-auto h-[calc(100%-2rem)]">
              {actionLog.map((entry, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="text-sm text-gray-500">
                    {entry.timestamp.toLocaleTimeString()}
                  </div>
                  {entry.type === 'place_droplets' ? (
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">Place Droplets</span>
                        <span className="text-gray-600">
                          {` at Well (${entry.position.x}, ${entry.position.y})`}
                        </span>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 ml-4">
                        <div className="text-sm font-medium text-blue-800 mb-1">Drop Counts:</div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mb-1" />
                            <span className="font-mono">{entry.drops?.[0]}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mb-1" />
                            <span className="font-mono">{entry.drops?.[1]}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mb-1" />
                            <span className="font-mono">{entry.drops?.[2]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">Read Color</span>
                        <span className="text-gray-600">
                          {` at Well (${entry.position.x}, ${entry.position.y})`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-2 ml-4">
                        <div 
                          className="w-6 h-6 rounded-lg shadow-inner" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="font-mono text-sm">{entry.color}</span>
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
