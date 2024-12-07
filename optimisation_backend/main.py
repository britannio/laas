from flask import Flask, jsonify, Response
from bayes_opt import BayesOpt
from model import VirtualLab

app = Flask(__name__)
model = VirtualLab()


@app.route("/go", methods=["GET"])
def go() -> Response:
    """Runs the Bayesian Optimization with default parameters.

    Returns:
        Response: A JSON response indicating the request was received.
    """
    bo = BayesOpt(model, target=[90, 10, 130], n_calls=20, space=None)
    result = bo.run()
    print(result.x)

    return jsonify({"message": "GET request received"})


@app.route("/go_params/<int:r>/<int:g>/<int:b>/<int:n_calls>", methods=["GET"])
def go_params(r: int, g: int, b: int, n_calls: int) -> Response:
    """Runs the Bayesian Optimization with specified parameters.

    Args:
        r (int): Red target value.
        g (int): Green target value.
        b (int): Blue target value.
        n_calls (int): Number of calls for the optimization.

    Returns:
        Response: A JSON response indicating the request was received.
    """
    bo = BayesOpt(model, target=(r, g, b), n_calls=n_calls, space=None)
    result = bo.run()
    print(result.x)

    return jsonify({"message": "GET request received"})


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


if __name__ == "__main__":
    app.run(debug=True, port=5001)
