import { BeakerIcon } from 'lucide-react';
import { ExperimentStepper } from './components/ExperimentStepper';

function App() {
  return (
    <div className="h-screen flex flex-col">
      <header className="flex-none bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BeakerIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">LaaS</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 bg-gray-50">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
          <ExperimentStepper />
        </div>
      </main>
    </div>
  );
}

export default App;
