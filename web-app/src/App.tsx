import { useExperimentStore } from './stores/experimentStore';
import { Objective } from './types/experiment';
import { BeakerIcon } from 'lucide-react';
import { PlanExperiment } from './components/PlanExperiment';
import { RunExperiment } from './components/RunExperiment';

function App() {
  const wells = useExperimentStore((state) => state.wells);
  const activeWell = useExperimentStore((state) => state.activeWell);
  const objective = useExperimentStore((state) => state.objective);
  const setObjective = useExperimentStore((state) => state.setObjective);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left half - Plan */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Plan Experiment</h2>
              <PlanExperiment />
            </div>
            {/* Add the new Objective section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Objective</h2>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Select Objective
                  </label>
                  <select 
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={objective?.type || ''}
                    onChange={(e) => {
                      const type = e.target.value as Objective['type'];
                      setObjective({ type, value: 50 }); // Default value of 50
                    }}
                  >
                    <option value="">Select an objective</option>
                    <option value="targetSaturation">Target Saturation</option>
                    <option value="targetIntensity">Target Intensity</option>
                  </select>
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
