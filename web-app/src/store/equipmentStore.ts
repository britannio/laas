import { create } from 'zustand';
import type { AnyEquipment } from '@/types/equipment';

interface EquipmentState {
  equipment: Record<string, AnyEquipment>;
  addEquipment: (equipment: AnyEquipment) => void;
  updateEquipmentStatus: (id: string, status: AnyEquipment['status']) => void;
  updateEquipmentPosition: (id: string, x: number, y: number) => void;
}

export const useEquipmentStore = create<EquipmentState>()((set) => ({
  equipment: {
    microplate: {
      id: 'microplate',
      type: 'microplate',
      name: '96-Well Microplate',
      status: 'idle',
      gridSize: { rows: 8, cols: 12 }
    },
    dyePump: {
      id: 'dyePump',
      type: 'dyePump',
      name: 'Triple Dye Pump',
      status: 'idle',
      dyeColors: ['#FF0000', '#00FF00', '#0000FF'],
      maxDrops: 10
    },
    camera: {
      id: 'camera',
      type: 'camera',
      name: 'Microplate Camera',
      status: 'idle',
      resolution: '1920x1080'
    }
  },
  addEquipment: (equipment) =>
    set((state) => ({
      equipment: { ...state.equipment, [equipment.id]: equipment }
    })),
  updateEquipmentStatus: (id, status) =>
    set((state) => ({
      equipment: {
        ...state.equipment,
        [id]: { ...state.equipment[id], status }
      }
    })),
  updateEquipmentPosition: (id, x, y) =>
    set((state) => ({
      equipment: {
        ...state.equipment,
        [id]: { ...state.equipment[id], position: { x, y } }
      }
    }))
}));