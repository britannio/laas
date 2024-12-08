import React, { useState } from "react";
import { useExperimentStore } from "../stores/experimentStore";
import { useEquipmentStore } from "../stores/equipmentStore";
import { EquipmentPanel } from "./EquipmentPanel";
import { ObjectivePanel } from "./ObjectivePanel";
import { OptimizerPanel } from "./OptimizerPanel";
import { RunExperiment } from "./RunExperiment";
import { cn } from "../lib/utils";

const steps = [
  {
    id: "equipment",
    title: "Select Equipment",
    description: "Choose the required laboratory equipment",
    component: EquipmentPanel,
  },
  {
    id: "objective",
    title: "Set Objective",
    description: "Define your experiment goals",
    component: ObjectivePanel,
  },
  {
    id: "optimizer",
    title: "Choose Optimiser",
    description: "Select optimisation method",
    component: OptimizerPanel,
  },
  {
    id: "run",
    title: "Run Experiment",
    description: "Execute and monitor experiment",
    component: RunExperiment,
  },
] as const;

export function ExperimentStepper() {
  const equipment = useEquipmentStore((state) => state.equipment);
  const objective = useExperimentStore((state) => state.objective);
  const optimizer = useExperimentStore((state) => state.optimizer);

  const [currentStep, setCurrentStep] = useState(0);

  const canProceed = (step: number) => {
    switch (step) {
      case 0: // Equipment selection
        return Object.values(equipment).some((eq) => eq.status === "idle");
      case 1: // Objective
        return !!objective;
      case 2: // Optimizer
        return !!optimizer;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex flex-col items-center w-full",
              index !== steps.length - 1 && "relative",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center",
                "relative z-10 bg-white",
                index <= currentStep
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-400",
              )}
            >
              {index + 1}
            </div>
            <div className="mt-2 text-center">
              <div
                className={cn(
                  "font-medium",
                  index <= currentStep ? "text-blue-600" : "text-gray-400",
                )}
              >
                {step.title}
              </div>
              <div
                className={cn(
                  "text-sm",
                  index <= currentStep ? "text-gray-600" : "text-gray-400",
                )}
              >
                {step.description}
              </div>
            </div>
            {index !== steps.length - 1 && (
              <div
                className={cn(
                  "absolute top-5 left-1/2 w-full h-0.5",
                  "z-0",
                  index < currentStep ? "bg-blue-500" : "bg-gray-200",
                )}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {steps[currentStep].component && (
          <div>
            {React.createElement(steps[currentStep].component, {
              onNext: () => {
                if (canProceed(currentStep)) {
                  setCurrentStep((prev) => prev + 1);
                }
              },
              onBack: () => {
                setCurrentStep((prev) => Math.max(0, prev - 1));
              },
            })}
          </div>
        )}
      </div>
    </div>
  );
}
