import { useExperimentStore } from '../stores/experimentStore';
import { cn } from '../lib/utils';

export function OptimizerPanel() {
  const optimizer = useExperimentStore((state) => state.optimizer);
  const setOptimizer = useExperimentStore((state) => state.setOptimizer);

  return (
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
  );
}
