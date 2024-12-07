import { WellPlate } from './WellPlate';
import { ExperimentControls } from './ExperimentControls';
import { useExperimentStore } from '@/store/experimentStore';

export function RunExperiment() {
  const wells = useExperimentStore((state) => state.wells);
  const activeWell = useExperimentStore((state) => state.activeWell);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <WellPlate
          wells={wells}
          activeWell={activeWell ?? undefined}
          onWellClick={(x, y) => console.log(`Clicked well: ${x},${y}`)}
        />
      </div>
      
      <div className="space-y-4">
        <ExperimentControls />
      </div>
    </div>
  );
}
