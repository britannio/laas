export interface EquipmentCost {
  setupCost: number;  // in pounds
  perMinuteCost: number;  // in pounds per minute
}

export const equipmentCosts: Record<string, EquipmentCost> = {
  microplate: {
    setupCost: 5,
    perMinuteCost: 0.10,
  },
  dyePump: {
    setupCost: 15,
    perMinuteCost: 0.25,
  },
  camera: {
    setupCost: 10,
    perMinuteCost: 0.15,
  },
  thermometer: {
    setupCost: 3,
    perMinuteCost: 0.05,
  },
  phMeter: {
    setupCost: 8,
    perMinuteCost: 0.12,
  },
  spectrophotometer: {
    setupCost: 20,
    perMinuteCost: 0.30,
  },
  vortexMixer: {
    setupCost: 5,
    perMinuteCost: 0.08,
  },
};
