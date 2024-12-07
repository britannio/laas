import { useState } from 'react';
import { WellPlate } from './WellPlate';
import { ExperimentControls } from './ExperimentControls';
import { useExperimentStore } from '../stores/experimentStore';
import { useEquipmentStore } from '../stores/equipmentStore';
import { cn } from '../lib/utils';

export function RunExperiment({ onBack }: { onBack: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const wells = useExperimentStore((state) => state.wells);
  const activeWell = useExperimentStore((state) => state.activeWell);
  const objective = useExperimentStore((state) => state.objective);
  const optimizer = useExperimentStore((state) => state.optimizer);
  const equipment = useEquipmentStore((state) => state.equipment);

  const handleStartExperiment = () => {
    setIsRunning(true);
    // Simulate experiment progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);
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

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700">Equipment</h4>
          <p className="text-sm text-blue-600">
            {Object.values(equipment).filter(eq => eq.status === 'idle').length} devices ready
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700">Objective</h4>
          <p className="text-sm text-blue-600">
            {objective?.type === 'targetSaturation' ? 'Color Saturation' : 'Color Intensity'}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700">Optimizer</h4>
          <p className="text-sm text-blue-600">
            {optimizer?.type.charAt(0).toUpperCase() + optimizer?.type.slice(1)}
          </p>
        </div>
      </div>

      {/* Well Plate Visualization */}
      <div className="space-y-4">
        <WellPlate
          wells={wells}
          activeWell={activeWell}
          onWellClick={(x, y) => console.log(`Clicked well: ${x},${y}`)}
        />
      </div>
      
      {/* Progress bar */}
      {isRunning && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
