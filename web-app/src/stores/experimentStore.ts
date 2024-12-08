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
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  wells: {
    // Test data for first few wells
    // "0,0": {
    //   color: "#FF8844",
    //   drops: [2, 1, 1]
    // },
    // "1,0": {
    //   color: "#7733FF",
    //   drops: [1, 3, 2]
    // },
    // "0,1": {
    //   color: "#44FF88",
    //   drops: [1, 2, 1]
    // }
  },
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
}));
