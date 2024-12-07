from flask import Flask, jsonify, Response, request
from bayes_opt import BayesOpt
from model import VirtualLab
from background_tasks import BackgroundTaskManager, OptimizationTask

app = Flask(__name__)
model = VirtualLab()
task_manager = BackgroundTaskManager()


@app.route("/go", methods=["POST"])
def go() -> Response:
    """Starts a Bayesian Optimization run with default parameters.

    Returns:
        Response: A JSON response with the run ID.
    """
    run_id = request.json.get("run_id")
    if not run_id:
        return jsonify({"error": "run_id is required"}), 400

    bo = BayesOpt(model, target=[90, 10, 130], n_calls=20, space=None)
    task = OptimizationTask(run_id=run_id, target=(90, 10, 130), n_calls=20)
    
    if task_manager.start_task(task, bo):
        return jsonify({"message": "Optimization started", "run_id": run_id})
    else:
        return jsonify({"error": "Another optimization is already running"}), 409


@app.route("/go_params/<int:r>/<int:g>/<int:b>/<int:n_calls>", methods=["POST"])
def go_params(r: int, g: int, b: int, n_calls: int) -> Response:
    """Starts a Bayesian Optimization run with specified parameters.

    Args:
        r (int): Red target value.
        g (int): Green target value.
        b (int): Blue target value.
        n_calls (int): Number of calls for the optimization.

    Returns:
        Response: A JSON response with the run ID.
    """
    run_id = request.json.get("run_id")
    if not run_id:
        return jsonify({"error": "run_id is required"}), 400

    bo = BayesOpt(model, target=(r, g, b), n_calls=n_calls, space=None)
    task = OptimizationTask(run_id=run_id, target=(r, g, b), n_calls=n_calls)
    
    if task_manager.start_task(task, bo):
        return jsonify({"message": "Optimization started", "run_id": run_id})
    else:
        return jsonify({"error": "Another optimization is already running"}), 409


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


@app.route("/status/<run_id>", methods=["GET"])
def get_run_status(run_id: str) -> Response:
    """Get the status of a specific optimization run.

    Args:
        run_id (str): The ID of the optimization run.

    Returns:
        Response: A JSON response with the run status.
    """
    status = task_manager.get_status(run_id)
    if status is None:
        return jsonify({"error": "Run not found"}), 404
    return jsonify(status)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
