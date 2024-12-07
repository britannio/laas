from multiprocessing import Process, Lock, Manager
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, field
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
        self._experiments: Dict[str, Experiment] = {}
        self._manager = Manager()
        self._shared_action_logs = self._manager.dict()  # Shared dictionary for action logs

    def start_experiment(self, experiment: Experiment, optimizer) -> bool:
        print('requesting lock')
        with self._lock:
            print('got lock')
            # Cancel any existing experiment
            self.cancel_current_experiment()
            print('cancelled existing experiment')

            self._current_experiment = experiment
            self._experiments[experiment.experiment_id] = experiment
            self._current_experiment.optimizer = optimizer
            self._current_experiment.status = "running"
            self._current_experiment.start_time = datetime.now()
            
            # Initialize shared action log for this experiment
            self._shared_action_logs[experiment.experiment_id] = self._manager.list()

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

    def get_action_log(self, experiment_id: str) -> Optional[List[Dict[str, Any]]]:
        """Gets the action log for a specific experiment."""
        if experiment_id not in self._shared_action_logs:
            print(f"Warning: Attempted to get action log for non-existent experiment {experiment_id}")
            return None
            
        action_log = list(self._shared_action_logs[experiment_id])  # Convert to regular list
        print(f"Retrieving action log for experiment {experiment_id}")
        print(f"Action log length: {len(action_log)}")
        return action_log

    def add_action(self, experiment_id: str, action_type: str, data: Dict[str, Any]) -> bool:
        """Adds an action to an experiment's log."""
        if experiment_id not in self._shared_action_logs:
            print(f"Warning: Attempted to add action to non-existent experiment {experiment_id}")
            return False
            
        action = {
            "type": action_type,
            "data": data,
            "experiment_id": experiment_id,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        self._shared_action_logs[experiment_id].append(action)
        print(f"Added action to experiment {experiment_id}: {action_type}")
        print(f"Current action log length: {len(self._shared_action_logs[experiment_id])}")
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
