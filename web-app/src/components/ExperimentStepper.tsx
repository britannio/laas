import { useExperimentStore } from '../stores/experimentStore';
import { useEquipmentStore } from '../stores/equipmentStore';
import { EquipmentPanel } from './EquipmentPanel';
import { ObjectivePanel } from './ObjectivePanel';
import { OptimizerPanel } from './OptimizerPanel';
import { RunExperiment } from './RunExperiment';
import { cn } from '../lib/utils';

const steps = [
  {
    id: 'equipment',
    title: 'Select Equipment',
    description: 'Choose the required laboratory equipment',
    component: EquipmentPanel,
  },
  {
    id: 'objective',
    title: 'Set Objective',
    description: 'Define your experiment goals',
    component: ObjectivePanel,
  },
  {
    id: 'optimizer',
    title: 'Choose Optimizer',
    description: 'Select optimization method',
    component: OptimizerPanel,
  },
  {
    id: 'run',
    title: 'Run Experiment',
    description: 'Execute and monitor experiment',
    component: RunExperiment,
  },
] as const;

export function ExperimentStepper() {
  const equipment = useEquipmentStore((state) => state.equipment);
  const objective = useExperimentStore((state) => state.objective);
  const optimizer = useExperimentStore((state) => state.optimizer);

  // Determine current step based on completion status
  const getCurrentStep = () => {
    const hasSelectedEquipment = Object.values(equipment).some(
      (eq) => eq.status === 'idle'
    );
    if (!hasSelectedEquipment) return 0;
    if (!objective) return 1;
    if (!optimizer) return 2;
    return 3;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex flex-col items-center w-full",
              index !== steps.length - 1 && "relative"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center",
                index <= currentStep
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-400"
              )}
            >
              {index + 1}
            </div>
            <div className="mt-2 text-center">
              <div className={cn(
                "font-medium",
                index <= currentStep ? "text-blue-600" : "text-gray-400"
              )}>
                {step.title}
              </div>
              <div className={cn(
                "text-sm",
                index <= currentStep ? "text-gray-600" : "text-gray-400"
              )}>
                {step.description}
              </div>
            </div>
            {index !== steps.length - 1 && (
              <div
                className={cn(
                  "absolute top-5 left-1/2 w-full h-0.5",
                  index < currentStep ? "bg-blue-500" : "bg-gray-200"
                )}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {steps[currentStep].component && (
          <steps[currentStep].component />
        )}
      </div>
    </div>
  );
}
