from flask import Flask, jsonify, request
import numpy as np
from typing import List, Tuple

app = Flask(__name__)


class VirtualLab:
    def __init__(self):
        # Initialize 96-well plate (8x12 standard layout)
        # Each well contains [R, G, B] values
        self.plate = np.zeros((8, 12, 3), dtype=np.float32)

        # Define dye colors [R, G, B]
        self.dyes = [
            [1.0, 0.0, 0.0],  # Dye A - Red
            [0.0, 1.0, 0.0],  # Dye B - Green
            [0.0, 0.0, 1.0],  # Dye C - Blue
        ]

    def validate_position(self, x: int, y: int) -> bool:
        return 0 <= x < 8 and 0 <= y < 12

    def add_dyes(self, x: int, y: int, drops: List[int]) -> bool:
        if not self.validate_position(x, y):
            return False

        # Calculate the final color based on dye amounts
        for dye_idx, drop_count in enumerate(drops):
            if drop_count > 0:
                # Simple color mixing model - each drop contributes proportionally
                self.plate[x, y] += np.array(self.dyes[dye_idx]) * (
                    drop_count / sum(drops)
                )

        # Ensure values stay in valid range [0, 1]
        self.plate[x, y] = np.clip(self.plate[x, y], 0, 1)
        return True

    def get_well_color(self, x: int, y: int) -> str:
        if not self.validate_position(x, y):
            return None

        # Convert float values [0-1] to RGB integers [0-255]
        rgb = (self.plate[x, y] * 255).astype(int)
        # Convert to hex color string
        hex_color = "#{:02x}{:02x}{:02x}".format(rgb[0], rgb[1], rgb[2])
        return hex_color


# Create virtual lab instance
lab = VirtualLab()


@app.route("/well/<int:x>/<int:y>/add_dyes", methods=["POST"])
def add_dyes(x: int, y: int):
    data = request.get_json()

    if "drops" not in data or len(data["drops"]) != 3:
        return (
            jsonify({"error": "Invalid drops data. Must provide array of 3 integers."}),
            400,
        )

    drops = data["drops"]
    if not all(isinstance(d, int) and d >= 0 for d in drops):
        return jsonify({"error": "All drop counts must be non-negative integers."}), 400

    if sum(drops) == 0:
        return jsonify({"error": "Must add at least one drop of dye."}), 400

    if not lab.add_dyes(x, y, drops):
        return jsonify({"error": "Invalid well position."}), 400

    return jsonify({"status": "success"})


@app.route("/well/<int:x>/<int:y>/color", methods=["GET"])
def get_well_color(x: int, y: int):
    color = lab.get_well_color(x, y)
    if color is None:
        return jsonify({"error": "Invalid well position."}), 400

    print(f"Color at ({x}, {y}): {color}")
    return jsonify({"color": color})  # Returns hex color string like "#ff0000"


if __name__ == "__main__":
    app.run(debug=True)
