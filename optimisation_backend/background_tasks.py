from multiprocessing import Process
from typing import Optional, Dict, List, Any
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
    process: Optional[Process] = None

class BackgroundTaskManager:
    def __init__(self):
        self._current_experiment: Optional[Experiment] = None
        self._experiments: Dict[str, Experiment] = {}
        self._action_logs: Dict[str, List[Dict[str, Any]]] = {}

    def start_experiment(self, experiment: Experiment, optimizer) -> bool:
        # Cancel any existing experiment
        self.cancel_current_experiment()

        self._current_experiment = experiment
        self._experiments[experiment.experiment_id] = experiment
        self._current_experiment.optimizer = optimizer
        self._current_experiment.status = "running"
        self._current_experiment.start_time = datetime.now()
        
        # Initialize action log for this experiment
        self._action_logs[experiment.experiment_id] = []

        # Create and start process for just the optimization
        process = Process(target=self._run_optimization, args=(optimizer,))
        self._current_experiment.process = process
        process.start()
        return True

    def _run_optimization(self, optimizer):
        try:
            result = optimizer.run()
            self._current_experiment.status = "completed"
        except Exception as e:
            self._current_experiment.status = "failed"
            print(f"Optimization failed: {e}")
        finally:
            self._current_experiment.end_time = datetime.now()

    def cancel_current_experiment(self) -> bool:
        """Cancels the current experiment if one exists."""
        if not self._current_experiment:
            return False

        if self._current_experiment.process and self._current_experiment.process.is_alive():
            self._current_experiment.process.terminate()
            self._current_experiment.process.join(timeout=1.0)
            if self._current_experiment.process.is_alive():
                self._current_experiment.process.kill()
                self._current_experiment.process.join()

        self._current_experiment.status = "cancelled"
        self._current_experiment.end_time = datetime.now()
        return True

    def get_action_log(self, experiment_id: str) -> Optional[List[Dict[str, Any]]]:
        return self._action_logs.get(experiment_id)

    def add_action(self, experiment_id: str, action_type: str, data: Dict[str, Any]) -> bool:
        if experiment_id not in self._action_logs:
            print(f"Warning: Attempted to add action to non-existent experiment {experiment_id}")
            return False
            
        action = {
            "type": action_type,
            "data": data,
            "experiment_id": experiment_id,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        self._action_logs[experiment_id].append(action)
        return True

    def get_experiment_status(self, experiment_id: str) -> Optional[Dict]:
        if not self._current_experiment or self._current_experiment.experiment_id != experiment_id:
            return None

        return {
            "experiment_id": self._current_experiment.experiment_id,
            "status": self._current_experiment.status,
            "start_time": self._current_experiment.start_time.isoformat() if self._current_experiment.start_time else None,
            "end_time": self._current_experiment.end_time.isoformat() if self._current_experiment.end_time else None,
        }
