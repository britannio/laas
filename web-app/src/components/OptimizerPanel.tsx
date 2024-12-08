import { useExperimentStore } from "../stores/experimentStore";
import { cn } from "../lib/utils";
import { DEFAULT_MAX_STEPS } from "../lib/experimentApi";

export function OptimizerPanel({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const optimizer = useExperimentStore((state) => state.optimizer);
  const setOptimizer = useExperimentStore((state) => state.setOptimizer);

  const handleOptimizerSelect = (type: typeof optimizers[number]['type']) => {
    setOptimizer({ 
      type,
      steps: optimizer?.steps || DEFAULT_MAX_STEPS 
    });
  };

  const handleStepsChange = (steps: number) => {
    if (optimizer) {
      setOptimizer({
        ...optimizer,
        steps
      });
    }
  };

  const optimizers = [
    {
      type: "bayesian",
      title: "Bayesian Optimisation",
      description: "Efficient parameter space exploration",
    },
    {
      type: "rsm",
      title: "Response Surface Methodology",
      description: "Statistical technique for process optimisation",
    },
    {
      type: "nelder-mead",
      title: "Nelder-Mead Simplex",
      description: "Direct search method for optimisation",
    },
    {
      type: "pso",
      title: "Particle Swarm Optimisation",
      description: "Population-based optimisation algorithm",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            "bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!optimizer}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            !optimizer
              ? "bg-gray-100 text-gray-400"
              : "bg-blue-600 text-white hover:bg-blue-700",
          )}
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {optimizers.map((method) => (
          <button
            key={method.type}
            className={cn(
              "p-4 rounded-lg border-2 transition-all",
              "flex flex-col items-center justify-center text-center space-y-2",
              optimizer?.type === method.type
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50",
            )}
            onClick={() => handleOptimizerSelect(method.type)}
          >
            <div className="font-medium">{method.title}</div>
            <div className="text-sm text-gray-500">{method.description}</div>
          </button>
        ))}
      </div>

      {/* Add steps configuration */}
      {optimizer && (
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                Maximum Experiment Steps
              </label>
              <span className="text-sm text-gray-500">
                {optimizer.steps} steps
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={optimizer.steps || DEFAULT_MAX_STEPS}
              onChange={(e) => handleStepsChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5</span>
              <span>50</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
