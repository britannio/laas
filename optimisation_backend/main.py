from flask import Flask, jsonify, Response
from flask_cors import CORS
from typing import Union, Tuple, Optional, Dict, List, Any
from multiprocessing import freeze_support, Process
from dataclasses import dataclass
from datetime import datetime
import numpy as np
from skopt import gp_minimize
from skopt.space import Integer, Dimension
import time
import requests

# Constants
VIRTUAL_LAB_BASE_URL = "http://127.0.0.1:5000"

app = Flask(__name__)

def well_num_to_x_y(num: int) -> tuple[int, int]:
    """Converts a well number to x, y coordinates."""
    return num // 12, num % 12

def convert_hex_to_rgb(hex: str) -> list[int]:
    """Converts a hex color code to an RGB list."""
    return list(int(hex[i : i + 2], 16) for i in (0, 2, 4))

class LabManager:
    @staticmethod
    def add_dyes(well_x: int, well_y: int, drops: list[int]) -> None:
        url = f"{VIRTUAL_LAB_BASE_URL}/well/{well_x}/{well_y}/add_dyes"
        headers = {"Content-Type": "application/json"}
        data = {"drops": drops}
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            print(response.json())
        else:
            print(f"Request failed with status code {response.status_code}")

    @staticmethod
    def get_well_color(well_x: int, well_y: int) -> str:
        url = f"{VIRTUAL_LAB_BASE_URL}/well/{well_x}/{well_y}/color"
        response = requests.get(url)
        if response.status_code == 200:
            print(response.json())
        else:
            print(f"Request failed with status code {response.status_code}")
        return response.json()["color"]

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
        self.cancel_current_experiment()
        self._current_experiment = experiment
        self._experiments[experiment.experiment_id] = experiment
        self._current_experiment.optimizer = optimizer
        self._current_experiment.status = "running"
        self._current_experiment.start_time = datetime.now()
        self._action_logs[experiment.experiment_id] = []
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

class BayesOpt:
    def __init__(self, target: list[int], n_calls: int, experiment_id: str, 
                 task_manager: BackgroundTaskManager, space: list[Dimension] | None = None):
        self.target = target
        self.current_well = 0
        self.n_calls = n_calls
        self.space = space or [
            Integer(0, 5, name="A"),
            Integer(0, 5, name="B"),
            Integer(0, 5, name="C"),
        ]
        self.random_state = 42
        self.experiment_id = experiment_id
        self.task_manager = task_manager

    def objective_function(self, params: list[int]) -> float:
        x, y = well_num_to_x_y(self.current_well)
        
        self.task_manager.add_action(
            self.experiment_id,
            "place",
            {
                "x": x,
                "y": y,
                "timestamp": time.time(),
                "well_number": self.current_well,
                "droplet_counts": [int(x) for x in params],
            }
        )

        LabManager.add_dyes(x, y, drops=[int(x) for x in params])
        well_color = LabManager.get_well_color(x, y)
        rgb = convert_hex_to_rgb(well_color[1:])

        self.task_manager.add_action(
            self.experiment_id,
            "read",
            {
                "x": x,
                "y": y,
                "timestamp": time.time(),
                "well_number": self.current_well,
                "color": well_color,
            }
        )

        loss = ((np.array(self.target) - np.array(rgb)) ** 2).mean()
        print(f"Well {self.current_well}: params={params}, rgb={rgb}, target={self.target}, loss={loss}")
        time.sleep(0.5)
        self.current_well += 1
        return loss

    def run(self) -> dict:
        return gp_minimize(
            self.objective_function,
            self.space,
            n_calls=self.n_calls,
            random_state=self.random_state,
        )
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Range", "X-Content-Range"]
    }
})

task_manager = BackgroundTaskManager()


@app.route("/experiments/<experiment_id>/start_experiment", methods=["POST"])
def start_experiment(experiment_id: str) -> Union[Response, Tuple[Response, int]]:
    """Starts a Bayesian Optimization experiment with default parameters."""
    print(f"Starting new experiment with ID: {experiment_id}")

    # Create experiment instance first
    experiment = Experiment(
        experiment_id=experiment_id,
        target=(90, 10, 130),
        n_calls=20
    )

    # Create optimizer with reference to task manager
    bo = BayesOpt(
        # virtualLab,
        target=[90, 10, 130],
        n_calls=20,
        experiment_id=experiment_id,
        task_manager=task_manager,
        space=None
    )

    print('Starting experiment in background')
    task_manager.start_experiment(experiment, bo)
    print('Experiment started')

    return jsonify({
        "message": "Optimization started",
        "experiment_id": experiment_id
    }), 200

@app.route("/experiments/<experiment_id>/optimize/<int:r>/<int:g>/<int:b>/<int:n_calls>", methods=["POST"])
def start_experiment_with_params(experiment_id: str, r: int, g: int, b: int, n_calls: int) -> Response:
    """Starts a Bayesian Optimization experiment with specified parameters."""
    bo = BayesOpt(
        # virtualLab,
        target=(r, g, b), n_calls=n_calls, experiment_id=experiment_id, space=None)
    experiment = Experiment(experiment_id=experiment_id, target=(r, g, b), n_calls=n_calls)

    task_manager.start_experiment(experiment, bo)
    return jsonify({"message": "Optimization started", "experiment_id": experiment_id})


@app.route("/experiments/<experiment_id>/action_log", methods=["GET"])
def get_action_log(experiment_id: str) -> Union[Response, Tuple[Response, int]]:
    """Get the action log for a specific experiment."""
    print(f"Fetching action log for experiment {experiment_id}")
    action_log = task_manager.get_action_log(experiment_id)

    if action_log is None:
        print(f"No action log found for experiment {experiment_id}")
        return jsonify({"error": "Experiment not found"}), 404

    print(f"Found action log with {len(action_log)} entries")
    print(action_log)
    return jsonify(action_log)


@app.route("/well_color/<int:x>/<int:y>", methods=["GET"])
def get_well_color(x: int, y: int) -> Union[Response, Tuple[Response, int]]:
    """Endpoint to get the color of a well given its x, y coordinates.

    Args:
        x (int): The row index.
        y (int): The column index.

    Returns:
        Response: A JSON response containing the color of the well or an error message.
    """
    color = virtualLab.get_well_color(x, y)
    if color is None:
        return jsonify({"error": "Invalid well coordinates"}), 400
    return jsonify({"color": color})


# @app.route("/status", methods=["GET"])
# def get_experiment_status() -> Response:
#     """Endpoint to get the experiment status from the model.

#     Returns:
#         Response: A JSON response containing the experiment status.
#     """
#     return jsonify({"experiment_status": model.experiment_completeness_ratio})


@app.route("/experiments/<experiment_id>/status", methods=["GET"])
def get_experiment_status(experiment_id: str) -> Union[Response, Tuple[Response, int]]:
    """Get the status of a specific optimization experiment."""
    status = task_manager.get_experiment_status(experiment_id)
    if status is None:
        return jsonify({"error": "Experiment not found"}), 404
    return jsonify(status)

@app.route("/cancel_experiment", methods=["POST"])
def cancel_experiment() -> Union[Response, Tuple[Response, int]]:

    task_manager.cancel_current_experiment()
    return jsonify({"message": "Experiment cancelled successfully"})
    # else:
        # return jsonify({"error": "No running experiment to cancel"}), 400

if __name__ == "__main__":
    # Initialize multiprocessing support
    freeze_support()

    # Initialize the application
    init_app()

    # Run the Flask app
    app.run(debug=True, port=5001)
else:
    # Initialize for when running from a WSGI server
    init_app()
