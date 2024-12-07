from flask import Flask, jsonify, request

from bayes_opt import BayesOpt

from model import VirtualLab


app = Flask(__name__)
model = VirtualLab()


@app.route("/go", methods=["GET"])
def go():
    bo = BayesOpt(model, target=(90, 10, 130), n_calls=20, space=None)
    result = bo.run()
    print(result.x)

    return jsonify({"message": "GET request received"})


@app.route("/go_params/<int:r>/<int:g>/<int:b>/<int:n_calls>", methods=["GET"])
def go_params(r: int, g: int, b: int, n_calls: int):

    bo = BayesOpt(model, target=(r, g, b), n_calls=n_calls, space=None)
    result = bo.run()
    print(result.x)

    return jsonify({"message": "GET request received"})


if __name__ == "__main__":
    app.run(debug=True, port=5001)
