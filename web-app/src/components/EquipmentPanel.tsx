import { equipmentIcons } from '../lib/icons';
import { useEquipmentStore } from '../stores/equipmentStore';
import { cn } from '../lib/utils';

export function EquipmentPanel() {
  const equipment = useEquipmentStore((state) => state.equipment);
  const toggleEquipment = useEquipmentStore((state) => state.toggleEquipment);

  const equipmentCards = [
    {
      type: 'microplate',
      title: 'Microplate',
      description: '96-well plate for sample handling'
    },
    {
      type: 'dyePump',
      title: 'Dye Pump',
      description: 'Precise dye dispensing system'
    },
    {
      type: 'camera',
      title: 'Camera',
      description: 'High-resolution imaging system'
    }
  ] as const;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Laboratory Equipment</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {equipmentCards.map((item) => {
          const Icon = equipmentIcons[item.type];
          const equipmentItem = equipment[item.type];
          const isSelected = equipmentItem?.status === 'idle';

          return (
            <button
              key={item.type}
              className={cn(
                "p-4 rounded-lg border-2 transition-all",
                "flex flex-col items-center justify-center text-center space-y-2",
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
              )}
              onClick={() => toggleEquipment(item.type)}
            >
              <Icon className={cn(
                "h-8 w-8",
                isSelected ? 'text-blue-600' : 'text-gray-600'
              )} />
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-gray-500">{item.description}</div>
              {isSelected && (
                <div className="text-xs text-blue-600 font-medium">Selected</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
