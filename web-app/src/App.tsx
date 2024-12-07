import { useState } from 'react';
import { BeakerIcon } from 'lucide-react';
import { Button } from './components/ui/Button';
import { ExperimentFlow } from './components/ExperimentFlow';
import { WellPlate } from './components/WellPlate';
import { ExperimentControls } from './components/ExperimentControls';
import { CreateExperimentModal } from './components/CreateExperimentModal';
import { EquipmentPanel } from './components/EquipmentPanel';
import { useExperimentStore } from './store/experimentStore';

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create New Experiment
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Experiment Builder</h2>
              <ExperimentFlow />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <EquipmentPanel />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Well Plate Visualization</h2>
              <WellPlate
                wells={wells}
                activeWell={activeWell ?? undefined}
                onWellClick={(x, y) => console.log(`Clicked well: ${x},${y}`)}
            />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Experiment Controls</h2>
              <ExperimentControls />
            </div>
          </div>
        </div>
      </main>

      <CreateExperimentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

export default App;