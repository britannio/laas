import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { WellData } from '@/types/experiment';

interface WellPlateProps {
  wells: Record<string, WellData>;
  onWellClick?: (x: number, y: number) => void;
}

export const WellPlate = memo(({ wells, onWellClick }: WellPlateProps) => {
  return (
    <div className="relative">
      {/* Column labels (0-11) */}
      <div className="absolute -top-8 left-[4%] right-[4%] grid grid-cols-12 gap-[2%]">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={`col-${i}`} className="flex justify-center">
            <span className="text-sm font-medium text-gray-600">{i}</span>
          </div>
        ))}
      </div>

      {/* Row labels (0-7) */}
      <div className="absolute top-[4%] -left-6 bottom-[4%] grid grid-rows-8 gap-[2%]">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={`row-${i}`} className="flex items-center">
            <span className="text-sm font-medium text-gray-600">{i}</span>
          </div>
        ))}
      </div>

      {/* Well plate grid */}
      <div className="grid grid-cols-12 gap-[2%] aspect-[1.5/1] w-full bg-white rounded-lg shadow-lg p-[4%]">
        {Array.from({ length: 8 }, (_, row) =>
          Array.from({ length: 12 }, (_, col) => {
            const wellKey = `${row},${col}`;
            const well = wells[wellKey];
            const isActive = activeWell?.x === col && activeWell?.y === row;
            const isOccupied = !!well?.color;

            return (
              <button
                key={wellKey}
                onClick={() => onWellClick?.(col, row)}
                className={cn(
                  'aspect-square rounded-full transition-all',
                  'border-2',
                  isOccupied 
                    ? 'border-gray-400 hover:border-gray-600' 
                    : 'border-gray-300 hover:border-gray-400',
                  'hover:scale-105'
                )}
                style={{
                  backgroundColor: well?.color || 'transparent',
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
});

WellPlate.displayName = 'WellPlate';
