from flask import Flask, jsonify, Response
from flask_cors import CORS
from typing import Union, Tuple
from multiprocessing import freeze_support
from bayes_opt import BayesOpt
# from model import VirtualLab
from background_tasks import BackgroundTaskManager, Experiment

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*",  # Allow all origins
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Range", "X-Content-Range"]
    }
})

# Create these as global variables but initialize them later
virtualLab = None
task_manager = None

def init_app():
    global virtualLab, task_manager
    # virtualLab = VirtualLab()
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
