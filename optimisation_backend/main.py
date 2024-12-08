import os
from flask import Flask, jsonify, Response
from flask_cors import CORS
from typing import Union, Tuple, Optional, Dict, List, Any
from dataclasses import dataclass
from datetime import datetime
import numpy as np
from skopt import Optimizer
from skopt.space import Integer, Dimension
import time
import requests
from threading import Thread
import traceback
from openai import OpenAI
from dotenv import load_dotenv
from well_analyzer import WellPlateAnalyzer
from utils import rgb_to_hex

load_dotenv()

OPENAI_API = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API)
from dotenv import load_dotenv


# Constants
VIRTUAL_LAB_BASE_URL = "http://127.0.0.1:5000"
DEBUG_DELAY = 0.6
OPENAI_API = os.getenv("VIRTUAL_LAB_BASE_URL")

app = Flask(__name__)


def well_num_to_x_y(num: int) -> tuple[int, int]:
    """Converts a 96 well number to (x, y) coordinates."""
    return num // 12, num % 12


def convert_hex_to_rgb(hex_str: str) -> List[int]:
    """Converts a hex color code to an RGB list."""
    return [int(hex_str[i : i + 2], 16) for i in (0, 2, 4)]


class LabManager:
    @staticmethod
    def add_dyes(well_x: int, well_y: int, drops: List[int]) -> None:
        url = f"{VIRTUAL_LAB_BASE_URL}/well/{well_x}/{well_y}/add_dyes"
        headers = {"Content-Type": "application/json"}
        data = {"drops": drops}
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            print("Dyes added:", response.json())
        else:
            print(f"Request failed with status code {response.status_code}")

    @staticmethod
    def get_well_color(well_x: int, well_y: int) -> str:
        url = f"{VIRTUAL_LAB_BASE_URL}/image"
        response = requests.get(url)

        if response.status_code == 200:
            print("Image received successfully.")
        else:
            print(f"Request failed with status code {response.status_code}")

        image = np.asarray(bytearray(response.content), dtype="uint8")

        print("Analyzing image...")
        well_analyzer = WellPlateAnalyzer()
        results, output_image = well_analyzer.analyze_plate(image)
        print("Well colors analyzed.")

        return rgb_to_hex(*results[well_x, well_y])

    @staticmethod
    def clear_plate() -> None:
        url = f"{VIRTUAL_LAB_BASE_URL}/clear_plate"
        response = requests.post(url)
        if response.status_code == 200:
            print("Lab plate cleared.")
        else:
            print(f"Request failed with status code {response.status_code}.")


@dataclass
class Experiment:
    experiment_id: str
    target: tuple[int, int, int]
    n_calls: int
    status: str = "pending"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    optimizer: Any = None
    process: Optional[Thread] = None
    result: Optional[Dict[str, Any]] = None


class BackgroundTaskManager:
    def __init__(self):
        self._current_experiment: Optional[Experiment] = None
        self._experiments: Dict[str, Experiment] = {}
        self._action_logs: Dict[str, List[Dict[str, Any]]] = {}

    def start_experiment(self, experiment: Experiment, optimizer: Any) -> bool:
        """Starts a new experiment in a background thread."""
        self.cancel_current_experiment()
        self._current_experiment = experiment
        self._experiments[experiment.experiment_id] = experiment
        experiment.optimizer = optimizer
        experiment.status = "running"
        experiment.start_time = datetime.now()
        self._action_logs[experiment.experiment_id] = []

        thread = Thread(
            target=self._run_optimization, args=(optimizer, experiment.experiment_id)
        )
        experiment.process = thread
        thread.start()
        return True

    def _run_optimization(self, optimizer: Any, experiment_id: str):
        """Runs the optimization process in a background thread."""
        try:
            optimiser_result = optimizer.run()
            if (
                self._current_experiment
                and self._current_experiment.status != "cancelled"
            ):
                self._current_experiment.status = "completed"
                self._current_experiment.result = optimiser_result
        except Exception:
            if self._current_experiment:
                self._current_experiment.status = "failed"
            print(f"Optimization failed: {traceback.format_exc()}")
        finally:
            if self._current_experiment:
                self._current_experiment.end_time = datetime.now()

    def cancel_current_experiment(self) -> bool:
        """Attempts to cancel the current experiment if it's running."""
        if not self._current_experiment:
            return True
        experiment = self._current_experiment
        experiment.status = "cancelled"
        experiment.end_time = datetime.now()
        return True

    def is_cancelled(self, experiment_id: str) -> bool:
        """Check if the given experiment is cancelled."""
        experiment = self._experiments.get(experiment_id)
        return experiment is not None and experiment.status == "cancelled"

    def get_action_log(self, experiment_id: str) -> Optional[List[Dict[str, Any]]]:
        """Returns the action log for the given experiment_id."""
        return self._action_logs.get(experiment_id)

    def add_action(
        self, experiment_id: str, action_type: str, data: Dict[str, Any]
    ) -> bool:
        """Adds an action entry to the action log of an experiment."""
        if experiment_id not in self._action_logs:
            print(
                f"Warning: Attempted to add action to non-existent experiment {experiment_id}"
            )
            return False
        action = {
            "type": action_type,
            "data": data,
            "experiment_id": experiment_id,
            "timestamp": int(time.time()),
        }
        self._action_logs[experiment_id].append(action)
        return True

    def get_experiment_status(self, experiment_id: str) -> Optional[Dict[str, Any]]:
        """Returns a dictionary describing the status of the specified experiment."""
        experiment = self._experiments.get(experiment_id)
        if not experiment:
            return None
        return {
            "experiment_id": experiment.experiment_id,
            "status": experiment.status,
            "start_time": (
                experiment.start_time.isoformat() if experiment.start_time else None
            ),
            "end_time": (
                experiment.end_time.isoformat() if experiment.end_time else None
            ),
            "result": experiment.result or None,
        }


class Opt:
    def __init__(
        self,
        target: tuple[int, int, int],
        n_calls: int,
        experiment_id: str,
        task_manager: BackgroundTaskManager,
    ) -> None:
        self.target = target
        self.current_well = 0
        self.n_calls = n_calls
        self.random_state = 42
        self.experiment_id = experiment_id
        self.task_manager = task_manager

    def objective_function(self, params: List[int]) -> float: ...
    def run(self) -> Dict[str, Any]: ...


class BayesOpt(Opt):
    def __init__(
        self,
        target: tuple[int, int, int],
        n_calls: int,
        experiment_id: str,
        task_manager: BackgroundTaskManager,
        space: Optional[List[Dimension]] = None,
    ):
        super().__init__(target, n_calls, experiment_id, task_manager)

        self.space = space or [
            Integer(0, 5, name="A"),
            Integer(0, 5, name="B"),
            Integer(0, 5, name="C"),
        ]

    def objective_function(self, params: List[int]) -> float:
        x, y = well_num_to_x_y(self.current_well)

        self.task_manager.add_action(
            self.experiment_id,
            "place",
            {
                "x": x,
                "y": y,
                "well_number": self.current_well,
                "droplet_counts": [int(p) for p in params],
            },
        )

        LabManager.add_dyes(x, y, drops=[int(p) for p in params])
        well_color = LabManager.get_well_color(x, y)
        rgb = convert_hex_to_rgb(well_color[1:])

        self.task_manager.add_action(
            self.experiment_id,
            "read",
            {
                "x": x,
                "y": y,
                "well_number": self.current_well,
                "color": well_color,
            },
        )

        loss = ((np.array(self.target) - np.array(rgb)) ** 2).mean()
        print(
            f"Well {self.current_well}: params={params}, rgb={rgb}, target={self.target}, loss={loss}"
        )
        time.sleep(DEBUG_DELAY)
        self.current_well += 1
        return loss

    def run(self) -> Dict[str, Any]:
        """Run the Bayesian Optimization in an iterative manner to allow cancellation."""
        optimizer = Optimizer(dimensions=self.space, random_state=self.random_state)

        for i in range(self.n_calls):
            # Check if experiment is cancelled before each iteration
            if self.task_manager.is_cancelled(self.experiment_id):
                print("Experiment cancelled at iteration", i)
                return {"status": "cancelled", "iteration": i}

            x = optimizer.ask()
            loss = self.objective_function(x)
            optimizer.tell(x, loss)

        # After completion, return best result
        best_idx = np.argmin(optimizer.yi)

        print(
            {
                "x": [int(x) for x in optimizer.Xi[best_idx]],
                "fun": optimizer.yi[best_idx],
                "status": "completed",
            }
        )
        return {
            # Best state
            "optimal_combo": [int(x) for x in optimizer.Xi[best_idx]],
            "status": "completed",
        }


class LLMOpt(Opt):
    def __init__(
        self,
        target: tuple[int, int, int],
        n_calls: int,
        experiment_id: str,
        task_manager: BackgroundTaskManager,
    ):
        super().__init__(target, n_calls, experiment_id, task_manager)
        self.history = []
        self.best_loss = float("inf")
        self.best_params = None

    def _format_history(self) -> str:
        if not self.history:
            return "No previous attempts."

        history_text = "Previous attempts:\n"
        for attempt in self.history:
            history_text += f"- Used drops: {attempt['params']}, "
            history_text += f"Got RGB: {attempt['rgb']}, "
            history_text += f"Loss: {attempt['loss']:.2f}\n"
        return history_text

    def _get_llm_suggestion(self, current_rgb: List[int]) -> List[int]:
        prompt = f"""You are a color optimization expert. Given:
        - Current RGB color: {current_rgb}
        - Target RGB color: {self.target}

        {self._format_history()}

        Based on this information and previous attempts, suggest the optimal number of drops (0-5)
        of Red, Green, and Blue dyes to achieve the target RGB color.
        Consider the following:
        - Each drop has a non-linear effect on the final color
        - Previous attempts show how different combinations affected the color
        - Aim to minimize the difference between target and result RGB values

        Respond only with three numbers separated by commas representing Red,Green,Blue drops."""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise color mixing assistant.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=20,
        )

        print(response)

        red, green, blue = map(
            int, response.choices[0].message.content.strip().split(",")
        )
        return [red, green, blue]

    def objective_function(self, params: List[int]) -> float:
        x, y = well_num_to_x_y(self.current_well)

        self.task_manager.add_action(
            self.experiment_id,
            "place",
            {
                "x": x,
                "y": y,
                "well_number": self.current_well,
                "droplet_counts": [int(p) for p in params],
            },
        )

        LabManager.add_dyes(x, y, drops=[int(p) for p in params])
        well_color = LabManager.get_well_color(x, y)
        rgb = convert_hex_to_rgb(well_color[1:])

        self.task_manager.add_action(
            self.experiment_id,
            "read",
            {
                "x": x,
                "y": y,
                "well_number": self.current_well,
                "color": well_color,
            },
        )

        loss = ((np.array(self.target) - np.array(rgb)) ** 2).mean()

        # Store attempt in history
        self.history.append({"params": params, "rgb": rgb, "loss": loss})

        # Update best result
        if loss < self.best_loss:
            self.best_loss = loss
            self.best_params = params

        print(
            f"Well {self.current_well}: params={params}, rgb={rgb}, target={self.target}, loss={loss}"
        )
        time.sleep(DEBUG_DELAY)
        self.current_well += 1
        return loss

    def run(self) -> Dict[str, Any]:
        """Run the LLM-based Optimization in an iterative manner to allow cancellation."""
        current_rgb = [0, 0, 0]  # Start with empty well

        for i in range(self.n_calls):
            if self.task_manager.is_cancelled(self.experiment_id):
                print("Experiment cancelled at iteration", i)
                return {"status": "cancelled", "iteration": i}

            # Get suggestion from LLM
            try:
                params = self._get_llm_suggestion(current_rgb)
                loss = self.objective_function(params)
                current_rgb = convert_hex_to_rgb(
                    LabManager.get_well_color(*well_num_to_x_y(self.current_well - 1))[
                        1:
                    ]
                )
            except Exception as e:
                print(f"LLM suggestion failed: {e}")
                return {"status": "failed", "error": str(e)}

        return {
            "optimal_combo": self.best_params,
            "best_loss": self.best_loss,
            "status": "completed",
        }


CORS(
    app,
    resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Range", "X-Content-Range"],
        }
    },
)

task_manager = BackgroundTaskManager()


@app.route("/experiments/<experiment_id>/start_experiment", methods=["POST"])
def start_experiment(experiment_id: str) -> Union[Response, Tuple[Response, int]]:
    """Starts a Bayesian Optimization experiment with default parameters."""
    LabManager.clear_plate()  # clear the lab plate

    print(f"Starting new experiment with ID: {experiment_id}")
    experiment = Experiment(
        experiment_id=experiment_id, target=(90, 10, 130), n_calls=20
    )

    bo = BayesOpt(
        target=(90, 10, 130),
        n_calls=20,
        experiment_id=experiment_id,
        task_manager=task_manager,
        space=None,
    )

    task_manager.start_experiment(experiment, bo)

    return (
        jsonify({"message": "Optimization started", "experiment_id": experiment_id}),
        200,
    )


@app.route(
    "/experiments/<experiment_id>/optimize/<int:r>/<int:g>/<int:b>/<int:n_calls>",
    methods=["POST"],
)
def start_experiment_with_params(
    experiment_id: str, r: int, g: int, b: int, n_calls: int
) -> Response:
    """Starts a Bayesian Optimization experiment with specified parameters."""
    LabManager.clear_plate()  # clear the lab plate

    experiment = Experiment(
        experiment_id=experiment_id, target=(r, g, b), n_calls=n_calls
    )

    bo = BayesOpt(
        target=(r, g, b),
        n_calls=n_calls,
        experiment_id=experiment_id,
        task_manager=task_manager,
    )

    task_manager.start_experiment(experiment, bo)
    return jsonify({"message": "Optimization started", "experiment_id": experiment_id})


@app.route(
    "/experiments/<experiment_id>/optimize_llm/<int:r>/<int:g>/<int:b>/<int:n_calls>",
    methods=["POST"],
)
def start_experiment_llm_with_params(
    experiment_id: str, r: int, g: int, b: int, n_calls: int
) -> Response:
    """Starts an LLM-controlled experiment with specified parameters."""
    LabManager.clear_plate()  # clear the lab plate

    experiment = Experiment(
        experiment_id=experiment_id, target=(r, g, b), n_calls=n_calls
    )

    llm_opt = LLMOpt(
        target=(r, g, b),
        n_calls=n_calls,
        experiment_id=experiment_id,
        task_manager=task_manager,
    )

    task_manager.start_experiment(experiment, llm_opt)
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
    return jsonify(action_log), 200


@app.route("/experiments/<experiment_id>/status", methods=["GET"])
def get_experiment_status(experiment_id: str) -> Union[Response, Tuple[Response, int]]:
    """Get the status of a specific optimization experiment."""
    status = task_manager.get_experiment_status(experiment_id)
    if status is None:
        return jsonify({"error": "Experiment not found"}), 404
    return jsonify(status)


@app.route("/cancel_experiment", methods=["POST"])
def cancel_experiment() -> Union[Response, Tuple[Response, int]]:
    """Endpoint to cancel the currently running experiment."""
    result = task_manager.cancel_current_experiment()
    if result:
        return jsonify({"message": "Experiment cancelled successfully"}), 200
    else:
        return jsonify({"error": "No running experiment to cancel"}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5001)
