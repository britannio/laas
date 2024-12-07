import { useExperimentExecution } from '@/hooks/useExperimentExecution';
import { useExperimentStore } from '@/store/experimentStore';
import { Button } from './ui/Button';

export function ExperimentControls() {
  const experiment = useExperimentStore((state) => state.experiment);
  const { isRunning, progress, start, reset } = useExperimentExecution();

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Button
          variant="primary"
          onClick={start}
          disabled={!experiment || isRunning}
        >
          {isRunning ? 'Running...' : 'Start'}
        </Button>
        <Button
          variant="secondary"
          onClick={reset}
          disabled={!experiment || !isRunning}
        >
          Reset
        </Button>
      </div>
      
      {experiment && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}