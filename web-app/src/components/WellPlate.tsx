import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { WellData } from '@/types/experiment';

interface WellPlateProps {
  wells: Record<string, WellData>;
  activeWell?: { x: number; y: number };
  onWellClick?: (x: number, y: number) => void;
}

export const WellPlate = memo(({ wells, activeWell, onWellClick }: WellPlateProps) => {
  return (
    <div className="grid grid-cols-12 gap-[2%] aspect-[1.5/1] w-full bg-white rounded-lg shadow-lg p-[4%]">
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 12 }, (_, col) => {
          const wellKey = `${row},${col}`;
          const well = wells[wellKey];
          const isActive = activeWell?.x === col && activeWell?.y === row;

          return (
            <button
              key={wellKey}
              onClick={() => onWellClick?.(col, row)}
              className={cn(
                'aspect-square rounded-full transition-all',
                'border-2 hover:scale-105',
                {
                  'border-blue-500 ring-2 ring-blue-300': isActive,
                  'border-gray-300': !isActive,
                }
              )}
              style={{
                backgroundColor: well?.color || 'transparent',
              }}
            />
          );
        })
      )}
    </div>
  );
});
