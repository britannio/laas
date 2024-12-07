import { useExperimentStore } from './stores/experimentStore';
import { BeakerIcon } from 'lucide-react';
import { PlanExperiment } from './components/PlanExperiment';
import { RunExperiment } from './components/RunExperiment';

function App() {
  const wells = useExperimentStore((state) => state.wells);
  const activeWell = useExperimentStore((state) => state.activeWell);

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
              <p className="text-gray-600">
                Mix different combinations of dyes to create new colors and observe their interactions.
              </p>
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
