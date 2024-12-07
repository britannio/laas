import { create } from 'zustand';
import type { EquipmentType, AnyEquipment } from '../types/equipment';

interface EquipmentState {
  equipment: Partial<Record<EquipmentType, AnyEquipment>>;
  toggleEquipment: (type: EquipmentType) => void;
}

export const useEquipmentStore = create<EquipmentState>()((set) => ({
  equipment: {
    // Compulsory equipment
    microplate: {
      id: 'microplate',
      type: 'microplate',
      name: '96-Well Microplate',
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
    // Optional equipment
    thermometer: {
      id: 'thermometer',
      type: 'thermometer',
      name: 'Digital Thermometer',
      status: 'busy',
      temperatureRange: '-50°C to 150°C'
    },
    phMeter: {
      id: 'phMeter',
      type: 'phMeter',
      name: 'pH Meter',
      status: 'busy',
      range: '0-14 pH'
    },
    spectrophotometer: {
      id: 'spectrophotometer',
      type: 'spectrophotometer',
      name: 'Spectrophotometer',
      status: 'busy',
      wavelengthRange: '200-1000nm'
    },
    vortexMixer: {
      id: 'vortexMixer',
      type: 'vortexMixer',
      name: 'Vortex Mixer',
      status: 'busy',
      speedRange: '0-3000 RPM'
    }
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
