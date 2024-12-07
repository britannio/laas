import { WellCoordinate } from './experiment';

export type CompulsoryEquipmentType = 'microplate' | 'dyePump' | 'camera';
export type OptionalEquipmentType = 'thermometer' | 'phMeter' | 'spectrophotometer' | 'vortexMixer';
export type EquipmentType = CompulsoryEquipmentType | OptionalEquipmentType;

interface BaseEquipment {
  id: string;
  type: EquipmentType;
  name: string;
  status: 'idle' | 'busy' | 'error';
  position?: WellCoordinate;
}

export interface MicroplateEquipment extends BaseEquipment {
  type: 'microplate';
  gridSize: { rows: number; cols: number };
}

export interface DyePumpEquipment extends BaseEquipment {
  type: 'dyePump';
  dyeColors: string[];
  maxDrops: number;
}

export interface CameraEquipment extends BaseEquipment {
  type: 'camera';
  resolution: string;
}

export interface ThermometerEquipment extends BaseEquipment {
  type: 'thermometer';
  temperatureRange: string;
}

export interface PhMeterEquipment extends BaseEquipment {
  type: 'phMeter';
  range: string;
}

export interface SpectrophotometerEquipment extends BaseEquipment {
  type: 'spectrophotometer';
  wavelengthRange: string;
}

export interface VortexMixerEquipment extends BaseEquipment {
  type: 'vortexMixer';
  speedRange: string;
}

export type AnyEquipment = 
  | MicroplateEquipment 
  | DyePumpEquipment 
  | CameraEquipment 
  | ThermometerEquipment 
  | PhMeterEquipment 
  | SpectrophotometerEquipment 
  | VortexMixerEquipment;
