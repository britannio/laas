from threading import Thread, Lock
from typing import Optional, Dict
from dataclasses import dataclass
from datetime import datetime

@dataclass
class OptimizationTask:
    run_id: str
    target: tuple[int, int, int]
    n_calls: int
    status: str = "pending"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class BackgroundTaskManager:
    def __init__(self):
        self._lock = Lock()
        self._current_task: Optional[OptimizationTask] = None
        
    def start_task(self, task: OptimizationTask, optimizer) -> bool:
        with self._lock:
            if self._current_task and self._current_task.status == "running":
                return False
                
            self._current_task = task
            self._current_task.status = "running"
            self._current_task.start_time = datetime.now()
            
            Thread(target=self._run_optimization, args=(optimizer,), daemon=True).start()
            return True
            
    def _run_optimization(self, optimizer):
        try:
            result = optimizer.run()
            self._current_task.status = "completed"
        except Exception as e:
            self._current_task.status = "failed"
            print(f"Optimization failed: {e}")
        finally:
            self._current_task.end_time = datetime.now()
            
    def get_status(self, run_id: str) -> Optional[Dict]:
        if not self._current_task or self._current_task.run_id != run_id:
            return None
            
        return {
            "run_id": self._current_task.run_id,
            "status": self._current_task.status,
            "start_time": self._current_task.start_time.isoformat() if self._current_task.start_time else None,
            "end_time": self._current_task.end_time.isoformat() if self._current_task.end_time else None,
            "progress": self._current_task.optimizer.model.experiment_completeness_ratio if self._current_task.status == "running" else None
        }
