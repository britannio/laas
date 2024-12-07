import numpy as np
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime


class Well:
    def __init__(self):
        """Initializes a Well with default drops and color."""
        self.drops: np.ndarray = np.zeros(3, dtype=np.float32)
        self.color: np.ndarray = np.zeros(3, dtype=np.float32)



class VirtualLab:
    def __init__(self):
        """Initializes a VirtualLab with a 96-well plate and predefined dye colors."""
        # Initialize 96-well plate (8x12 standard layout)
        self.plate: List[List[Well]] = [[Well() for _ in range(12)] for _ in range(8)]
        self.experiment_completeness_ratio = 0

        # Define dye colors [R, G, B]
        self.dyes: List[List[float]] = [
            [1.0, 0.0, 0.0],  # Dye A
            [0.0, 1.0, 0.0],  # Dye B
            [0.0, 0.0, 1.0],  # Dye C
        ]

    def set_current_experiment(self, experiment_id: str) -> None:
        """Sets the current experiment ID and creates a new action log if needed.
        
        Args:
            experiment_id (str): The ID of the experiment to set as current
        """
        self.current_experiment_id = experiment_id
        if experiment_id not in self.action_logs:
            self.action_logs[experiment_id] = ActionLog(experiment_id)

    def validate_position(self, x: int, y: int) -> bool:
        """Validates if the given position is within the bounds of the plate.

        Args:
            x (int): The row index.
            y (int): The column index.

        Returns:
            bool: True if the position is valid, False otherwise.
        """
        return 0 <= x < 8 and 0 <= y < 12

    def add_dyes(self, x: int, y: int, drops: List[int]) -> bool:
        """Adds dyes to a specific well and updates its color.

        Args:
            x (int): The row index.
            y (int): The column index.
            drops (List[int]): The list of dye drops to add.

        Returns:
            bool: True if the dyes were added successfully, False otherwise.
        """
        if not self.validate_position(x, y) or self.current_experiment_id is None:
            return False

        well = self.plate[x][y]
        well.drops = np.array(drops)

        # Calculate the final color based on dye amounts
        for dye_idx, drop_count in enumerate(drops):
            if drop_count > 0:
                # Simple color mixing model - each drop contributes proportionally
                well.color += np.array(self.dyes[dye_idx]) * (drop_count / sum(drops))

        # Ensure values stay in valid range [0, 1]
        well.color = np.clip(well.color, 0, 1)

        # Log the action
        self.action_logs[self.current_experiment_id].add_action(
            "place",
            {
                "x": x,
                "y": y,
                "droplet_counts": drops,
                "timestamp": datetime.utcnow().isoformat() + "Z",
            },
        )
        return True

    def add_well_color_reading(self, x: int, y: int, rgb: Tuple[int, int, int]) -> None:
        """Logs a color reading action for a specific well."""
        if self.current_experiment_id is None:
            return

        hex_color = "#{:02x}{:02x}{:02x}".format(rgb[0], rgb[1], rgb[2])

        # Log the action
        self.action_logs[self.current_experiment_id].add_action(
            "read",
            {
                "x": x,
                "y": y,
                "color": hex_color,
                "timestamp": datetime.utcnow().isoformat() + "Z",
            },
        )

    def get_well_drops(self, x: int, y: int) -> Optional[np.ndarray]:
        """Gets the drops of dyes in a specific well.

        Args:
            x (int): The row index.
            y (int): The column index.

        Returns:
            Optional[np.ndarray]: The array of dye drops in the well, or None if the position is invalid.
        """
        if not self.validate_position(x, y):
            return None

        well = self.plate[x][y]
        return well.drops.astype(int)

    def get_well_color(self, x: int, y: int) -> Optional[str]:
        """Gets the color of a specific well in hex format.

        Args:
            x (int): The row index.
            y (int): The column index.

        Returns:
            Optional[str]: The hex color string of the well, or None if the position is invalid.
        """
        if not self.validate_position(x, y):
            return None

        well = self.plate[x][y]
        # Convert float values [0-1] to RGB integers [0-255]
        rgb = (well.color * 255).astype(int)
        # Convert to hex color string
        hex_color = "#{:02x}{:02x}{:02x}".format(rgb[0], rgb[1], rgb[2])
        return hex_color
