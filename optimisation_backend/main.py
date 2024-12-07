from flask import Flask, jsonify, Response, request
from typing import Union, Tuple
from bayes_opt import BayesOpt
from model import VirtualLab
from background_tasks import BackgroundTaskManager, Experiment

app = Flask(__name__)
model = VirtualLab()
task_manager = BackgroundTaskManager()


@app.route("/experiments/<experiment_id>/optimize", methods=["POST"])
def start_experiment(experiment_id: str) -> Response:
    """Starts a Bayesian Optimization experiment with default parameters.

    Returns:
        Response: A JSON response with the experiment ID.
    """
    bo = BayesOpt(model, target=[90, 10, 130], n_calls=20, space=None)
    experiment = Experiment(experiment_id=experiment_id, target=(90, 10, 130), n_calls=20)
    
    task_manager.start_experiment(experiment, bo)
    return jsonify({"message": "Optimization started", "experiment_id": experiment_id})

@app.route("/experiments/<experiment_id>/optimize/<int:r>/<int:g>/<int:b>/<int:n_calls>", methods=["POST"])
def start_experiment_with_params(experiment_id: str, r: int, g: int, b: int, n_calls: int) -> Response:
    """Starts a Bayesian Optimization experiment with specified parameters."""
    bo = BayesOpt(model, target=(r, g, b), n_calls=n_calls, space=None)
    experiment = Experiment(experiment_id=experiment_id, target=(r, g, b), n_calls=n_calls)
    
    task_manager.start_experiment(experiment, bo)
    return jsonify({"message": "Optimization started", "experiment_id": experiment_id})


@app.route("/action_log", methods=["GET"])
def get_action_log() -> Response:
    """Endpoint to get the entire action log from the model.

    Returns:
        Response: A JSON response containing the action log.
    """
    return jsonify(model.action_log.actions)


@app.route("/well_color/<int:x>/<int:y>", methods=["GET"])
def get_well_color(x: int, y: int) -> Response:
    """Endpoint to get the color of a well given its x, y coordinates.

    Args:
        x (int): The row index.
        y (int): The column index.

    Returns:
        Response: A JSON response containing the color of the well or an error message.
    """
    color = model.get_well_color(x, y)
    if color is None:
        return jsonify({"error": "Invalid well coordinates"}), 400
    return jsonify({"color": color})


@app.route("/status", methods=["GET"])
def get_experiment_status() -> Response:
    """Endpoint to get the experiment status from the model.

    Returns:
        Response: A JSON response containing the experiment status.
    """
    return jsonify({"experiment_status": model.experiment_completeness_ratio})


@app.route("/experiments/<experiment_id>/status", methods=["GET"])
def get_experiment_status(experiment_id: str) -> Union[Response, Tuple[Response, int]]:
    """Get the status of a specific optimization experiment."""
    status = task_manager.get_experiment_status(experiment_id)
    if status is None:
        return jsonify({"error": "Experiment not found"}), 404
    return jsonify(status)

@app.route("/experiments/<experiment_id>/cancel", methods=["POST"])
def cancel_experiment(experiment_id: str) -> Union[Response, Tuple[Response, int]]:
    """Cancels the current experiment if it matches the given ID."""
    current_experiment = task_manager._current_experiment
    if not current_experiment or current_experiment.experiment_id != experiment_id:
        return jsonify({"error": "Experiment not found"}), 404
        
    if task_manager.cancel_current_experiment():
        return jsonify({"message": "Experiment cancelled successfully"})
    else:
        return jsonify({"error": "No running experiment to cancel"}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5001)
