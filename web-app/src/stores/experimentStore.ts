import { create } from "zustand";
import { WellData, Objective, Optimizer } from "../types/experiment";

interface ExperimentState {
  wells: Record<string, WellData>;
  objective: Objective | null;
  optimizer: Optimizer | null;
  updateWell: (x: number, y: number, data: WellData) => void;
  setObjective: (objective: Objective) => void;
  setOptimizer: (optimizer: Optimizer) => void;
  setWellColor: (x: number, y: number, color: string) => void;
  clearWells: () => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  wells: {},
  objective: null,
  optimizer: null,
  updateWell: (x: number, y: number, data: WellData) =>
    set((state) => ({
      wells: {
        ...state.wells,
        [`${x},${y}`]: data,
      },
    })),
  setObjective: (objective) => set({ objective }),
  setOptimizer: (optimizer) => set({ optimizer }),
  setWellColor: (x: number, y: number, color: string) =>
    set((state) => ({
      wells: {
        ...state.wells,
        [`${x},${y}`]: {
          ...(state.wells[`${x},${y}`] || {}),
          color,
        },
      },
    })),
  clearWells: () => set({ wells: {} }),
}));
