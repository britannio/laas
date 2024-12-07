import { useEquipmentStore } from '@/store/equipmentStore';
import { cn } from '@/lib/utils';
import { Beaker, Droplets, Camera } from 'lucide-react';

const equipmentIcons = {
  microplate: Beaker,
  dyePump: Droplets,
  camera: Camera,
};

export function EquipmentPanel() {
  const equipment = useEquipmentStore((state) => state.equipment);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Laboratory Equipment</h3>
      <div className="grid gap-4">
        {Object.values(equipment).map((item) => {
          const Icon = equipmentIcons[item.type];
          
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center space-x-3 p-3 rounded-lg border',
                'bg-white transition-colors',
                {
                  'border-green-200 bg-green-50': item.status === 'idle',
                  'border-yellow-200 bg-yellow-50': item.status === 'busy',
                  'border-red-200 bg-red-50': item.status === 'error',
                }
              )}
            >
              <div className={cn(
                'p-2 rounded-full',
                {
                  'bg-green-100 text-green-600': item.status === 'idle',
                  'bg-yellow-100 text-yellow-600': item.status === 'busy',
                  'bg-red-100 text-red-600': item.status === 'error',
                }
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-500 capitalize">{item.status}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}