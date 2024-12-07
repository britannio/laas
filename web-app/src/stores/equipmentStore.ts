import { create } from 'zustand';
import type { EquipmentType } from '../lib/icons';

type EquipmentStatus = 'idle' | 'busy' | 'error';

interface Equipment {
  id: string;
  type: EquipmentType;
  name: string;
  status: EquipmentStatus;
}

interface EquipmentState {
  equipment: Record<EquipmentType, Equipment>;
  toggleEquipment: (type: EquipmentType) => void;
}

export const useEquipmentStore = create<EquipmentState>((set) => ({
  equipment: {
    microplate: {
      id: '1',
      type: 'microplate',
      name: 'Microplate Reader',
      status: 'busy',
    },
    dyePump: {
      id: '2',
      type: 'dyePump',
      name: 'Dye Pump System',
      status: 'busy',
    },
    camera: {
      id: '3',
      type: 'camera',
      name: 'Imaging Camera',
      status: 'busy',
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
