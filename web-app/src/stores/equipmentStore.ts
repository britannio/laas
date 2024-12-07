import { create } from 'zustand';
import type { EquipmentType } from '../lib/icons';

type EquipmentStatus = 'idle' | 'busy' | 'error';

interface Equipment {
  id: string;
  type: EquipmentType;
  name: string;
  status: EquipmentStatus;
  gridSize?: { rows: number; cols: number };
  dyeColors?: string[];
  maxDrops?: number;
  resolution?: string;
}

interface EquipmentState {
  equipment: Record<EquipmentType, Equipment>;
  toggleEquipment: (type: EquipmentType) => void;
}

export const useEquipmentStore = create<EquipmentState>((set) => ({
  equipment: {
    microplate: {
      id: 'microplate',
      type: 'microplate',
      name: 'Microplate Reader',
      status: 'busy',
      gridSize: { rows: 8, cols: 12 }
    },
    dyePump: {
      id: 'dyePump',
      type: 'dyePump',
      name: 'Triple Dye Pump',
      status: 'busy',
      dyeColors: ['#FF0000', '#00FF00', '#0000FF'],
      maxDrops: 10
    },
    camera: {
      id: 'camera',
      type: 'camera',
      name: 'Microplate Camera',
      status: 'busy',
      resolution: '1920x1080'
    },
  },
  toggleEquipment: (type) => set((state) => ({
    equipment: {
      ...state.equipment,
      [type]: {
        ...state.equipment[type],
        // Simply toggle between selected (idle) and unselected (busy)
        status: state.equipment[type]?.status === 'idle' ? 'busy' : 'idle'
      }
    }
  })),
}));
