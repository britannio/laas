from multiprocessing import Process, Lock
from typing import Optional, Dict
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Experiment:
    experiment_id: str
    target: tuple[int, int, int]
    n_calls: int
    status: str = "pending"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    optimizer = None
    should_cancel: bool = False
    process: Optional[Process] = None

class BackgroundTaskManager:
    def __init__(self):
        self._lock = Lock()
        self._current_experiment: Optional[Experiment] = None

    def start_experiment(self, experiment: Experiment, optimizer) -> bool:
        print('requesting lock')
        with self._lock:
            print('got lock')
            # Cancel any existing experiment
            self.cancel_current_experiment()
            print('cancelled existing experiment')

            self._current_experiment = experiment
            self._current_experiment.optimizer = optimizer
            self._current_experiment.status = "running"
            self._current_experiment.start_time = datetime.now()

            # Create and store the process
            process = Process(target=self._run_optimization, args=(optimizer,))
            self._current_experiment.process = process
            process.start()
            return True

    def _run_optimization(self, optimizer):
        try:
            result = optimizer.run()
            if not self._current_experiment.should_cancel:
                self._current_experiment.status = "completed"
        except Exception as e:
            self._current_experiment.status = "failed"
            print(f"Optimization failed: {e}")
        finally:
            self._current_experiment.end_time = datetime.now()

    def cancel_current_experiment(self) -> bool:
        """Cancels the current experiment if one exists."""
        with self._lock:
            if not self._current_experiment:
                return False

            if self._current_experiment.process:
                # Terminate the process
                self._current_experiment.process.terminate()
                # Wait for process to finish
                self._current_experiment.process.join(timeout=1.0)
                # If process is still alive after timeout, kill it
                if self._current_experiment.process.is_alive():
                    self._current_experiment.process.kill()
                    self._current_experiment.process.join()

            self._current_experiment.status = "cancelled"
            self._current_experiment.end_time = datetime.now()
            return True

    def get_experiment_status(self, experiment_id: str) -> Optional[Dict]:
        if not self._current_experiment or self._current_experiment.experiment_id != experiment_id:
            return None

        return {
            "experiment_id": self._current_experiment.experiment_id,
            "status": self._current_experiment.status,
            "start_time": self._current_experiment.start_time.isoformat() if self._current_experiment.start_time else None,
            "end_time": self._current_experiment.end_time.isoformat() if self._current_experiment.end_time else None,
            "progress": self._current_experiment.optimizer.model.experiment_completeness_ratio if self._current_experiment.status == "running" else None
        }
