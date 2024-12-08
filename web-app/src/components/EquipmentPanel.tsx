import { equipmentIcons } from "../lib/icons";
import { useEquipmentStore } from "../stores/equipmentStore";
import { cn } from "../lib/utils";
import { equipmentCosts } from "../lib/costs";
import { useState } from "react";

export function EquipmentPanel({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [duration, setDuration] = useState(30); // Default 30 minutes
  const equipment = useEquipmentStore((state) => state.equipment);
  const toggleEquipment = useEquipmentStore((state) => state.toggleEquipment);

  // Calculate total costs
  const calculateCosts = (durationMins: number) => {
    let setupCost = 0;
    let runningCost = 0;

    Object.entries(equipment).forEach(([type, status]) => {
      if (status?.status === "idle") {
        const costs = equipmentCosts[type];
        setupCost += costs.setupCost;
        runningCost += costs.perMinuteCost * durationMins;
      }
    });

    const totalCost = setupCost + runningCost;
    const traditionalCost = totalCost * 8.5; // Traditional lab multiplier

    return { setupCost, runningCost, totalCost, traditionalCost };
  };

  const costs = calculateCosts(duration);

  const allEquipment = [
    {
      type: "microplate",
      title: "Microplate",
      description: "96-well plate for sample handling",
      required: true,
    },
    {
      type: "dyePump",
      title: "Dye Pump",
      description: "Precise dye dispensing system",
      required: true,
    },
    {
      type: "camera",
      title: "Camera",
      description: "High-resolution imaging system",
      required: true,
    },
    {
      type: "thermometer",
      title: "Thermometer",
      description: "Temperature monitoring",
      required: false,
    },
    {
      type: "phMeter",
      title: "pH Meter",
      description: "pH measurement system",
      required: false,
    },
    {
      type: "spectrophotometer",
      title: "Spectrophotometer",
      description: "Absorbance measurement",
      required: false,
    },
    {
      type: "vortexMixer",
      title: "Vortex Mixer",
      description: "Sample mixing system",
      required: false,
    },
  ] as const;

  const hasRequiredEquipment = allEquipment
    .filter((item) => item.required)
    .every((item) => equipment[item.type]?.status === "idle");

  return (
    <div className="space-y-4">
      {/* Navigation buttons at the top */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            "bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!hasRequiredEquipment}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            !hasRequiredEquipment
              ? "bg-gray-100 text-gray-400"
              : "bg-blue-600 text-white hover:bg-blue-700",
          )}
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {allEquipment.map((item) => (
          <EquipmentCard
            key={item.type}
            type={item.type}
            title={item.title}
            description={item.description}
            isSelected={equipment[item.type]?.status === "idle"}
            onToggle={() => toggleEquipment(item.type)}
            required={item.required}
            costs={equipmentCosts[item.type]}
          />
        ))}
      </div>

      {/* Cost Estimation Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Estimation</h3>
        
        {/* Duration Slider */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Duration: {duration} minutes
          </label>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Cost Comparison */}
        <div className="grid grid-cols-2 gap-6">
          {/* Platform Cost */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Platform Cost</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Setup Cost:</span>
                <span className="font-medium">£{costs.setupCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Running Cost:</span>
                <span className="font-medium">£{costs.runningCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-blue-700 font-medium pt-2 border-t">
                <span>Total Cost:</span>
                <span>£{costs.totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Traditional Lab Cost */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Traditional Lab Cost</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-700 font-medium pt-2">
                <span>Total Cost:</span>
                <span>£{costs.traditionalCost.toFixed(2)}</span>
              </div>
              <div className="text-green-600 text-xs mt-2">
                Save £{(costs.traditionalCost - costs.totalCost).toFixed(2)} with our platform
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { EquipmentType } from "../types/equipment";

interface EquipmentCardProps {
  type: EquipmentType;
  title: string;
  description: string;
  isSelected: boolean;
  onToggle: () => void;
  required: boolean;
  costs: EquipmentCost;
}

function EquipmentCard({
  type,
  title,
  description,
  isSelected,
  onToggle,
  required,
  costs,
}: EquipmentCardProps) {
  const Icon = equipmentIcons[type];

  return (
    <button
      className={cn(
        "p-4 rounded-lg border-2 transition-all",
        "flex flex-col items-center justify-center text-center space-y-2",
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50",
      )}
      onClick={onToggle}
    >
      <Icon
        className={cn(
          "h-8 w-8",
          isSelected ? "text-blue-600" : "text-gray-600",
        )}
      />
      <div className="font-medium">{title}</div>
      <div className="text-sm text-gray-500">{description}</div>
      <div className="text-sm">
        <div className="text-blue-600">Setup: £{costs.setupCost.toFixed(2)}</div>
        <div className="text-blue-600">Per min: £{costs.perMinuteCost.toFixed(2)}</div>
      </div>
      {required && (
        <div className="text-xs text-amber-600 font-medium">Required</div>
      )}
      {isSelected && (
        <div className="text-xs text-blue-600 font-medium">Selected</div>
      )}
    </button>
  );
}
