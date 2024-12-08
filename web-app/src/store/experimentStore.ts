import { create } from 'zustand';
import type { Experiment, ExperimentStep, WellData } from '@/types/experiment';

interface ExperimentState {
  experiment: Experiment | null;
  wells: Record<string, WellData>;
  activeWell: { x: number; y: number } | null;
  setExperiment: (experiment: Experiment) => void;
  addStep: (step: Omit<ExperimentStep, 'id'>) => void;
  updateWell: (x: number, y: number, data: WellData) => void;
  setActiveWell: (x: number, y: number | null) => void;
  setWellColor: (x: number, y: number, color: string) => void;
}

export const useExperimentStore = create<ExperimentState>()((set) => ({
  experiment: null,
  wells: {},
  activeWell: null,
  setExperiment: (experiment) => set({ experiment }),
  addStep: (stepData) => 
    set((state) => ({
      experiment: state.experiment ? {
        ...state.experiment,
        steps: [...state.experiment.steps, { ...stepData, id: crypto.randomUUID() }]
      } : null
    })),
  updateWell: (x, y, data) =>
    set((state) => ({
      wells: {
        ...state.wells,
        [`${x},${y}`]: data
      }
    })),
  setActiveWell: (x, y) =>
    set({ activeWell: y === null ? null : { x, y } }),
  setWellColor: (x: number, y: number, color: string) =>
    set((state) => ({
      wells: {
        ...state.wells,
        [`${x},${y}`]: {
          ...state.wells[`${x},${y}`] || {},
          color
        }
      }
    }))
}));
