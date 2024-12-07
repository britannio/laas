import { useExperimentStore } from '../stores/experimentStore';
import { cn } from '../lib/utils';

export function ObjectivePanel({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const objective = useExperimentStore((state) => state.objective);
  const setObjective = useExperimentStore((state) => state.setObjective);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <button
          className={cn(
            "p-6 rounded-lg border-2 transition-all w-full max-w-md",
            "flex flex-col items-center justify-center text-center space-y-4",
            objective?.type === 'targetColor'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
          )}
          onClick={() => setObjective({ type: 'targetColor', color: '#FF0000' })}
        >
          <div className="font-medium text-lg">Target Color</div>
          <div className="text-sm text-gray-500">Select a specific color to optimize for</div>
        </button>
      </div>

      {objective?.type === 'targetColor' && (
        <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-sm max-w-md mx-auto">
          <label className="text-sm font-medium text-gray-700 self-start">
            Choose Target Color
          </label>
          <div className="flex items-center space-x-4 w-full">
            <div className="relative flex-1">
              <input
                type="color"
                value={objective.color || '#FF0000'}
                onChange={(e) => {
                  setObjective({
                    ...objective,
                    color: e.target.value
                  });
                }}
                className="w-full h-12 rounded-lg cursor-pointer border border-gray-200"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-600">
                Selected Color
              </span>
              <span className="text-sm font-mono text-gray-500">
                {objective.color?.toUpperCase()}
              </span>
            </div>
          </div>
          <div 
            className="w-full h-24 rounded-lg shadow-inner"
            style={{ backgroundColor: objective.color || '#FF0000' }}
          />
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!objective?.color}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            !objective?.color
              ? "bg-gray-100 text-gray-400"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}
