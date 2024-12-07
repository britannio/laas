import { Beaker, Droplets, Camera } from 'lucide-react';

export const equipmentIcons = {
  microplate: Beaker,
  dyePump: Droplets,
  camera: Camera,
} as const;

export type EquipmentType = keyof typeof equipmentIcons;
