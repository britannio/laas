import requests

VIRTUAL_LAB_BASE_URL="http://127.0.0.1:5000"

class LabManager:
    def __init__(self):
        ...

    @staticmethod
    def add_dyes(well_x: int, well_y: int, drops: list[int]) -> None:
        """Add dyes to a specific well.

        Args:
            well_x (int): The x-coordinate of the well.
            well_y (int): The y-coordinate of the well.
            drops (list[int]): A list of integers representing the drops to add.
        """
        url = f"{VIRTUAL_LAB_BASE_URL}/well/{well_x}/{well_y}/add_dyes"
        headers = {"Content-Type": "application/json"}
        data = {"drops": drops}

        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            print(response.json())
        else:
            print(f"Request failed with status code {response.status_code}")


    @staticmethod
    def get_well_color(well_x: int, well_y: int) -> str:
        """Get the color of a specific well.

        Args:
            well_x (int): The x-coordinate of the well.
            well_y (int): The y-coordinate of the well.

        Returns:
            list[int]: A list of integers representing the color of the well in the RGB format.
        """
        url = f"{VIRTUAL_LAB_BASE_URL}/well/{well_x}/{well_y}/color"

        response = requests.get(url)

        if response.status_code == 200:
            print(response.json())
        else:
            print(f"Request failed with status code {response.status_code}")

        return response.json()["color"]
