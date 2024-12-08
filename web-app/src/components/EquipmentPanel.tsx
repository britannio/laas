import { BeakerIcon, FlaskConicalIcon } from 'lucide-react';
import { equipmentIcons } from "../lib/icons";
import { useEquipmentStore } from "../stores/equipmentStore";
import { cn } from "../lib/utils";
import { equipmentCosts } from "../lib/costs";
import { useState } from "react";

export function EquipmentPanel({
  onNext,
  onBack,
}: {
  onNext: (useLLM: boolean) => void;
  onBack: () => void;
}) {
  const [duration, setDuration] = useState(30); // Default 30 minutes
  const [useLLM, setUseLLM] = useState(false);
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
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            "bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          Back
        </button>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span>Use LLM</span>
            <input
              type="checkbox"
              checked={useLLM}
              onChange={(e) => setUseLLM(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <button
            onClick={() => onNext(useLLM)}
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
      </div>

      {/* Main content area - Equipment and Cost side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Equipment Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Equipment Selection</h3>
          <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* Right side - Cost Estimation */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Cost Estimation</h3>
          <div className="text-sm text-gray-500">
            All prices in GBP (£)
          </div>
        </div>
        
        {/* Duration Slider */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Experiment Duration
            </label>
            <span className="text-sm font-medium text-blue-600">
              {duration} minutes
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 min</span>
            <span>120 min</span>
          </div>
        </div>

        {/* Cost Comparison */}
        <div className="grid grid-cols-2 gap-6">
          {/* Platform Cost */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BeakerIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-blue-900">Platform Cost</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Setup Cost</span>
                <span className="font-medium text-blue-900">£{costs.setupCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Running Cost</span>
                <span className="font-medium text-blue-900">£{costs.runningCost.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-900">Total Cost</span>
                  <span className="text-lg font-semibold text-blue-900">£{costs.totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Traditional Lab Cost */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FlaskConicalIcon className="h-5 w-5 text-gray-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Traditional Lab Cost</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Equivalent Cost</span>
                <span className="font-medium text-gray-900">£{costs.traditionalCost.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-green-800">Total Savings</span>
                    <span className="text-lg font-semibold text-green-700">
                      £{(costs.traditionalCost - costs.totalCost).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-green-600">
                    {((costs.traditionalCost - costs.totalCost) / costs.traditionalCost * 100).toFixed(0)}% cheaper than traditional methods
                  </div>
                </div>
              </div>
            </div>
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
