import { useExperimentStore } from '../stores/experimentStore';
import { cn } from '../lib/utils';

export function ObjectivePanel() {
  const objective = useExperimentStore((state) => state.objective);
  const setObjective = useExperimentStore((state) => state.setObjective);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <button
          className={cn(
            "p-4 rounded-lg border-2 transition-all",
            "flex flex-col items-center justify-center text-center space-y-2",
            objective?.type === 'targetSaturation'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
          )}
          onClick={() => setObjective({ type: 'targetSaturation', value: 50 })}
        >
          <div className="font-medium">Target Saturation</div>
          <div className="text-sm text-gray-500">Optimize for specific color saturation</div>
        </button>

        <button
          className={cn(
            "p-4 rounded-lg border-2 transition-all",
            "flex flex-col items-center justify-center text-center space-y-2",
            objective?.type === 'targetIntensity'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
          )}
          onClick={() => setObjective({ type: 'targetIntensity', value: 50 })}
        >
          <div className="font-medium">Target Intensity</div>
          <div className="text-sm text-gray-500">Optimize for specific color intensity</div>
        </button>
      </div>

      {objective && (
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Target {objective.type === 'targetSaturation' ? 'Saturation' : 'Intensity'} Value
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="100"
              value={objective.value || 50}
              onChange={(e) => {
                setObjective({
                  ...objective,
                  value: parseInt(e.target.value)
                });
              }}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-12">
              {objective.value || 50}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
