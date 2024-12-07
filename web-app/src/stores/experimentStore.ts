import { create } from 'zustand';
import { WellData, Objective } from '../types/experiment';

interface ExperimentState {
  wells: Record<string, WellData>;
  activeWell?: { x: number; y: number };
  objective: Objective | null;
  setActiveWell: (x: number, y: number) => void;
  clearActiveWell: () => void;
  updateWell: (x: number, y: number, data: WellData) => void;
  setObjective: (objective: Objective) => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  wells: {},
  activeWell: undefined,
  objective: null,
  setActiveWell: (x: number, y: number) => set({ activeWell: { x, y } }),
  clearActiveWell: () => set({ activeWell: undefined }),
  updateWell: (x: number, y: number, data: WellData) =>
    set((state) => ({
      wells: {
        ...state.wells,
        [`${x},${y}`]: data,
      },
    })),
  setObjective: (objective) => set({ objective }),
}));
