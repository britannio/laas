import { 
  Beaker,
  Droplets,
  Camera,
  Thermometer,
  Flask,
  Activity,
  RotateCw
} from 'lucide-react';

export const equipmentIcons = {
  // Compulsory equipment
  microplate: Beaker,
  dyePump: Droplets,
  camera: Camera,
  // Optional equipment
  thermometer: Thermometer,
  phMeter: Flask,
  spectrophotometer: Activity,
  vortexMixer: RotateCw,
} as const;

export type EquipmentType = keyof typeof equipmentIcons;
