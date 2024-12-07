import { create } from 'zustand';
import { WellData } from '../types/experiment';

interface ExperimentState {
  wells: Record<string, WellData>;
  activeWell?: { x: number; y: number };
  setActiveWell: (x: number, y: number) => void;
  clearActiveWell: () => void;
  updateWell: (x: number, y: number, data: WellData) => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  wells: {},
  activeWell: undefined,
  setActiveWell: (x: number, y: number) => set({ activeWell: { x, y } }),
  clearActiveWell: () => set({ activeWell: undefined }),
  updateWell: (x: number, y: number, data: WellData) =>
    set((state) => ({
      wells: {
        ...state.wells,
        [`${x},${y}`]: data,
      },
    })),
}));
