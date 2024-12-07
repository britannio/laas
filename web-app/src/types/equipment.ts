import { WellCoordinate } from './experiment';

export type EquipmentType = 'microplate' | 'dyePump' | 'camera';

export interface Equipment {
  id: string;
  type: EquipmentType;
  name: string;
  status: 'idle' | 'busy' | 'error';
  position?: WellCoordinate;
}

export interface MicroplateEquipment extends Equipment {
  type: 'microplate';
  gridSize: { rows: number; cols: number };
}

export interface DyePumpEquipment extends Equipment {
  type: 'dyePump';
  dyeColors: [string, string, string];
  maxDrops: number;
}

export interface CameraEquipment extends Equipment {
  type: 'camera';
  resolution: string;
}

export type AnyEquipment = MicroplateEquipment | DyePumpEquipment | CameraEquipment;