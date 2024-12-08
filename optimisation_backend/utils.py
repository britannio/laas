def well_num_to_x_y(num: int) -> tuple[int, int]:
    """Converts a well number to x, y coordinates.

    Args:
        num (int): The well number.

    Returns:
        tuple[int, int]: The x, y coordinates.
    """
    return num // 12, num % 12


def convert_hex_to_rgb(hex: str) -> list[int]:
    """Converts a hex color code to an RGB list.

    Args:
        hex (str): The hex color code.

    Returns:
        list[int]: The RGB values.
    """
    return list(int(hex[i : i + 2], 16) for i in (0, 2, 4))
