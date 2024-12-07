export interface WellCoordinate {
  x: number;
  y: number;
}

export interface ExperimentStep {
  id: string;
  wellX: number;
  wellY: number;
  action: 'add_dyes' | 'get_color';
  drops?: [number, number, number]; // [dyeA, dyeB, dyeC]
}

export interface Experiment {
  id: string;
  name: string;
  steps: ExperimentStep[];
  status: 'draft' | 'running' | 'completed';
}

export interface WellData {
  color: string;
  drops: [number, number, number];
}export interface WellData {
  reagent?: string;
  volume?: number;
  concentration?: number;
  status?: 'planned' | 'in-progress' | 'completed' | 'error';
  results?: {
    measurement: number;
    timestamp: string;
  }[];
}
export interface WellData {
  // Existing WellData interface if any
}

export interface Objective {
  type: 'targetSaturation' | 'targetIntensity';
  value?: number; // The target value to achieve
}
