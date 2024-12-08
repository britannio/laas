import { equipmentIcons } from "../lib/icons";
import { useEquipmentStore } from "../stores/equipmentStore";
import { cn } from "../lib/utils";

export function EquipmentPanel({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const equipment = useEquipmentStore((state) => state.equipment);
  const toggleEquipment = useEquipmentStore((state) => state.toggleEquipment);

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
          />
        ))}
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
}

function EquipmentCard({
  type,
  title,
  description,
  isSelected,
  onToggle,
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
      {isSelected && (
        <div className="text-xs text-blue-600 font-medium">Selected</div>
      )}
    </button>
  );
}
