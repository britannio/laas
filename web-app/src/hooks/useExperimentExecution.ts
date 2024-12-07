import { useState, useCallback } from 'react';
import { useExperimentStore } from '@/store/experimentStore';
import { addDyesToWell, getWellColor } from '@/lib/api';
import type { ExperimentStep } from '@/types/experiment';

export function useExperimentExecution() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { experiment, updateWell, setActiveWell } = useExperimentStore();

  const executeStep = useCallback(async (step: ExperimentStep) => {
    setActiveWell(step.wellX, step.wellY);

    if (step.action === 'add_dyes' && step.drops) {
      await addDyesToWell(step.wellX, step.wellY, step.drops);
      updateWell(step.wellX, step.wellY, {
        drops: step.drops,
        color: 'pending'
      });
    } else if (step.action === 'get_color') {
      const color = await getWellColor(step.wellX, step.wellY);
      updateWell(step.wellX, step.wellY, {
        drops: [0, 0, 0],
        color
      });
    }
  }, [updateWell, setActiveWell]);

  const start = useCallback(async () => {
    if (!experiment || isRunning) return;
    
    setIsRunning(true);
    setCurrentStepIndex(0);

    for (const step of experiment.steps) {
      await executeStep(step);
      setCurrentStepIndex((i) => i + 1);
    }

    setIsRunning(false);
    setActiveWell(0, null);
  }, [experiment, isRunning, executeStep, setActiveWell]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setCurrentStepIndex(0);
    setActiveWell(0, null);
  }, [setActiveWell]);

  return {
    isRunning,
    currentStepIndex,
    progress: experiment ? (currentStepIndex / experiment.steps.length) * 100 : 0,
    start,
    reset
  };
}