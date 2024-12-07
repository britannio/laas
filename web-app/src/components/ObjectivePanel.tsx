import { useExperimentStore } from '../stores/experimentStore';
import { cn } from '../lib/utils';

export function ObjectivePanel({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const objective = useExperimentStore((state) => state.objective);
  const setObjective = useExperimentStore((state) => state.setObjective);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
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

        <button
          className={cn(
            "p-4 rounded-lg border-2 transition-all",
            "flex flex-col items-center justify-center text-center space-y-2",
            objective?.type === 'targetColor'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
          )}
          onClick={() => setObjective({ type: 'targetColor', color: '#FF0000' })}
        >
          <div className="font-medium">Target Color</div>
          <div className="text-sm text-gray-500">Optimize for specific color</div>
        </button>
      </div>

      {objective && (
        <div className="flex flex-col space-y-2">
          {(objective.type === 'targetSaturation' || objective.type === 'targetIntensity') && (
            <>
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
            </>
          )}

          {objective.type === 'targetColor' && (
            <>
              <label className="text-sm font-medium text-gray-700">
                Target Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={objective.color || '#FF0000'}
                  onChange={(e) => {
                    setObjective({
                      ...objective,
                      color: e.target.value
                    });
                  }}
                  className="h-10 w-20"
                />
                <span className="text-sm text-gray-600">
                  {objective.color?.toUpperCase()}
                </span>
              </div>
            </>
          )}
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
          disabled={!objective || (objective.type === 'targetColor' && !objective.color)}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            !objective || (objective.type === 'targetColor' && !objective.color)
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
