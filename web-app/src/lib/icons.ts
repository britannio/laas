import { 
  Beaker,
  Droplets,
  Camera,
  Thermometer,
  TestTubes,
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
  phMeter: TestTubes,
  spectrophotometer: Activity,
  vortexMixer: RotateCw,
} as const;

export type EquipmentType = keyof typeof equipmentIcons;
