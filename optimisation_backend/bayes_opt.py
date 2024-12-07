from skopt import gp_minimize
from skopt.space import Integer, Dimension
import numpy as np

from api_calls import add_dyes, get_well_color
from utils import well_num_to_x_y, convert_hex_to_rgb
import time


class BayesOpt:
    """Bayesian Optimization class for optimizing dye combinations."""

    def __init__(
        self, model, target: list[int], n_calls: int, space: list[Dimension] | None = None
    ):
        """Initializes the BayesOpt class with the given parameters.

        Args:
            model: The model to be optimized.
            target (list[int]): The target RGB color.
            n_calls (int): The number of optimization calls.
            space (list[Dimension], optional): The search space for the optimization.
        """
        # Define the search space
        self.model = model
        self.target = target
        self.current_well = 0
        self.n_calls = n_calls
        self.space = space
        self.random_state = 42

        if space is None:  # drops search space
            self.space = [
                Integer(0, 5, name="A"),
                Integer(0, 5, name="B"),
                Integer(0, 5, name="C"),
            ]

    def objective_function(self, params: list[int]) -> float:
        """Objective function for the Bayesian optimization.

        Args:
            params (list[int]): The parameters for the current optimization step.

        Returns:
            float: The loss value for the current step.
        """
        add_dyes(*well_num_to_x_y(self.current_well), drops=[int(x) for x in params])
        self.model.add_dyes(
            *well_num_to_x_y(self.current_well), drops=[int(x) for x in params]
        )  # register with the model

        status = get_well_color(*well_num_to_x_y(self.current_well))
        rgb = convert_hex_to_rgb(status[1:])

        self.model.add_well_color_reading(
            *well_num_to_x_y(self.current_well), rgb
        )  # register with the model

        loss = ((np.array(self.target) - np.array(rgb)) ** 2).mean()

        print(params, rgb, self.target, loss)

        time.sleep(0.5)

        self.current_well += 1
        self.model.experiment_completeness_ratio = self.current_well / self.n_calls
        return loss

    def run(self) -> dict:
        """Runs the Bayesian optimization process.

        Returns:
            dict: The result of the optimization process.
        """
        # Perform Bayesian optimization
        result = gp_minimize(
            self.objective_function,
            self.space,
            n_calls=self.n_calls,
            random_state=self.random_state,
        )
        return result
