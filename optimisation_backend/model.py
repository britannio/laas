import numpy as np


class VirtualLab:
    def __init__(self):
        # Initialize 96-well plate (8x12 standard layout)
        # Each well contains [R, G, B] values
        self.plate = np.zeros((8, 12, 3), dtype=np.float32)

        # Define dye colors [R, G, B]
        self.dyes = [
            [1.0, 0.0, 0.0],  # Dye A
            [0.0, 1.0, 0.0],  # Dye B
            [0.0, 0.0, 1.0],  # Dye C
        ]

    def validate_position(self, x: int, y: int) -> bool:
        return 0 <= x < 8 and 0 <= y < 12

    def add_dyes(self, x: int, y: int, drops: list[int]) -> bool:
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
