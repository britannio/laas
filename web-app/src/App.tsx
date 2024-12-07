import { BeakerIcon } from 'lucide-react';
import { ExperimentStepper } from './components/ExperimentStepper';

function App() {

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BeakerIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">LaaS</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExperimentStepper />
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
                <div className="mt-6 flex flex-col space-y-2">
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

            {/* Optimizer section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Optimizer</h2>
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

              {optimizer?.type === 'bayesian' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    Using Bayesian optimization to efficiently search the parameter space 
                    and find optimal dye combinations for your objective.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right half - Run */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Run Experiment</h2>
              <RunExperiment />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
