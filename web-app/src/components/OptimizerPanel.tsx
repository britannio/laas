import { useExperimentStore } from '../stores/experimentStore';
import { cn } from '../lib/utils';

export function OptimizerPanel({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const optimizer = useExperimentStore((state) => state.optimizer);
  const setOptimizer = useExperimentStore((state) => state.setOptimizer);

  return (
    <div className="space-y-6">
      {/* Navigation buttons moved to top */}

      <div className="grid grid-cols-2 gap-4">
        <button
          className={cn(
            "p-4 rounded-lg border-2 transition-all",
            "flex flex-col items-center justify-center text-center space-y-2",
            optimizer?.type === 'bayesian'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
          )}
          onClick={() => setOptimizer({ type: 'bayesian' })}
        >
          <div className="font-medium">Bayesian Optimization</div>
          <div className="text-sm text-gray-500">Efficient parameter space exploration</div>
        </button>

        {[
          {
            type: 'rsm',
            title: 'Response Surface Methodology',
            description: 'Statistical technique for process optimization'
          },
          {
            type: 'nelder-mead',
            title: 'Nelder-Mead Simplex',
            description: 'Direct search method for optimization'
          },
          {
            type: 'pso',
            title: 'Particle Swarm Optimization',
            description: 'Population-based optimization algorithm'
          }
        ].map((method) => (
          <div
            key={method.type}
            className={cn(
              "p-4 rounded-lg border-2 border-gray-200 bg-gray-50",
              "flex flex-col items-center justify-center text-center space-y-2 opacity-50"
            )}
          >
            <div className="font-medium">{method.title}</div>
            <div className="text-sm text-gray-500">{method.description}</div>
            <div className="text-xs text-blue-500 font-medium">Coming Soon</div>
          </div>
        ))}
      </div>

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
          disabled={!optimizer}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            !optimizer
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
