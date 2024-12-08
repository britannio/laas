import { LogEntry } from "./RunExperiment"; // You might want to move this interface to a separate types file

interface ActionLogProps {
  entries: LogEntry[];
  elapsedTime: number;
  optimalCombo?: [number, number, number];
}

export function ActionLog({ entries, elapsedTime, optimalCombo }: ActionLogProps) {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Timer and Step Count */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700">Time Elapsed</h4>
          <p className="text-2xl font-mono text-blue-600">
            {formatTime(elapsedTime)}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700">Steps Completed</h4>
          <p className="text-2xl font-mono text-blue-600">{entries.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700">Optimal Combination</h4>
          {optimalCombo ? (
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mb-1" />
                <span className="font-mono text-blue-600">{optimalCombo[0]}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mb-1" />
                <span className="font-mono text-blue-600">{optimalCombo[1]}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mb-1" />
                <span className="font-mono text-blue-600">{optimalCombo[2]}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-blue-600 mt-2">Pending completion...</p>
          )}
        </div>
      </div>

      {/* Action Log */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex-grow overflow-hidden">
        <h4 className="font-medium text-gray-700 mb-4">Action Log</h4>
        <div className="space-y-3 overflow-y-auto h-[calc(100%-2rem)]">
          {entries.map((entry, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="text-sm text-gray-500">
                {entry.timestamp.toLocaleTimeString()}
              </div>
              {entry.type === "place_droplets" ? (
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">Place Droplets</span>
                    <span className="text-gray-600">
                      {` at Well (${entry.position.x}, ${entry.position.y})`}
                    </span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 ml-4">
                    <div className="text-sm font-medium text-blue-800 mb-1">
                      Drop Counts:
                    </div>
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
  );
}
