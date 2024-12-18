import { LogEntry } from "./RunExperiment";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ActionLogProps {
  entries: LogEntry[];
}

export function ActionLog({
  entries,
}: ActionLogProps) {
  // Add a ref for the scrollable container
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full overflow-hidden">
        <h4 className="font-medium text-gray-700 mb-4">Action Log</h4>
        <div
          ref={scrollRef}
          className="space-y-3 overflow-y-auto h-[calc(100%-2rem)] scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {entries.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div className="text-sm text-gray-500">
                  {entry.timestamp.toLocaleTimeString()}
                </div>
                {entry.type === "place_droplets" ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-between items-start"
                  >
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
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-between items-center"
                  >
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
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
  );
}
