import cv2
import numpy as np
import os
from typing import List, Tuple, Optional, Dict, Union


class WellPlateAnalyzer:
    def __init__(
        self,
        image_path: Optional[str] = None,
        save_debug: bool = True,
    ):
        """Initializes the WellPlateAnalyzer.

        Args:
            image_path (Optional[str]): Path to the image file.
            camera_index (int): Index of the camera to use.
            save_debug (bool): Whether to save debug images.
        """
        self.image_path = image_path
        # Create debug directory if it doesn't exist
        self.save_debug = save_debug
        self.debug_dir = "debug_images"
        if not os.path.exists(self.debug_dir):
            os.makedirs(self.debug_dir)

    def save_debug_image(self, name: str, image: np.ndarray) -> None:
        """Save debug image to file.

        Args:
            name (str): Name of the debug image.
            image (np.ndarray): Image to save.
        """
        if self.save_debug:
            path = os.path.join(self.debug_dir, f"{name}.png")
            cv2.imwrite(path, image)
            print(f"Saved debug image: {path}")

    # def capture_frame(self) -> np.ndarray:
    #     """Capture a frame from the camera.

    #     Returns:
    #         np.ndarray: Captured frame.

    #     Raises:
    #         Exception: If the camera cannot be opened or frame cannot be captured.
    #     """
    #     cap = cv2.VideoCapture(self.camera_index)
    #     if not cap.isOpened():
    #         raise Exception(f"Failed to open camera: {self.camera_index}")

    #     # Allow the camera to warm up
    #     cv2.waitKey(1000)  # Wait for 1000ms (1 second)

    #     ret, frame = cap.read()

    #     cap.release()
    #     if not ret:
    #         raise Exception("Failed to capture frame from camera")
    #     return frame

    def detect_plate(self, image: np.ndarray) -> np.ndarray:
        """Detect the 96-well plate using the black sharpie outline.

        Args:
            image (np.ndarray): Input image.

        Returns:
            np.ndarray: Contour of the detected plate.

        Raises:
            Exception: If no plate is detected.
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        self.save_debug_image("01_grayscale", gray)

        # Apply adaptive thresholding to handle varying lighting
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 21, 10
        )
        self.save_debug_image("02_threshold", thresh)

        # Find contours
        contours, _ = cv2.findContours(
            thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        # Draw all contours for debugging
        contour_img = image.copy()
        cv2.drawContours(contour_img, contours, -1, (0, 255, 0), 2)
        self.save_debug_image("03_all_contours", contour_img)

        # Find the contour that's most like a rectangle
        best_rect = None
        best_score = 0

        for contour in contours:
            if cv2.contourArea(contour) < 1000:  # Filter out small contours
                continue

            # Get the minimum area rectangle
            rect = cv2.minAreaRect(contour)
            box = cv2.boxPoints(rect)
            box = np.int32(box)  # Changed from int0 to int32

            # Calculate rectangle metrics
            width = rect[1][0]
            height = rect[1][1]
            aspect_ratio = max(width, height) / min(width, height)

            # Score the rectangle based on size and aspect ratio
            # 96-well plate typically has aspect ratio around 1.5
            aspect_score = 1 - abs(1.5 - aspect_ratio) / 1.5
            size_score = cv2.contourArea(box) / (image.shape[0] * image.shape[1])
            score = aspect_score * size_score

            if score > best_score:
                best_score = score
                best_rect = box

        if best_rect is None:
            raise Exception("No plate detected")

        # Draw best rectangle for debugging
        rect_img = image.copy()
        cv2.drawContours(rect_img, [best_rect], -1, (0, 0, 255), 2)
        self.save_debug_image("04_detected_plate", rect_img)

        return best_rect

    def transform_perspective(
        self, image: np.ndarray, points: np.ndarray
    ) -> np.ndarray:
        """Transform the perspective to get a top-down view.

        Args:
            image (np.ndarray): Input image.
            points (np.ndarray): Points for perspective transformation.

        Returns:
            np.ndarray: Warped image.
        """
        # Order points in clockwise order starting from top-left
        rect = np.zeros((4, 2), dtype="float32")

        # Get sum and diff of points for ordering
        s = points.sum(axis=1)
        d = np.diff(points, axis=1)

        rect[0] = points[np.argmin(s)]  # Top-left
        rect[2] = points[np.argmax(s)]  # Bottom-right
        rect[1] = points[np.argmin(d)]  # Top-right
        rect[3] = points[np.argmax(d)]  # Bottom-left

        # Get width and height
        width = 800  # Fixed width for consistent results
        height = int(width * (2 / 3))  # Maintain typical 96-well plate aspect ratio

        # Create destination points
        dst = np.array(
            [[0, 0], [width - 1, 0], [width - 1, height - 1], [0, height - 1]],
            dtype="float32",
        )

        # Calculate perspective transform matrix
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(image, M, (width, height))

        self.save_debug_image("05_transformed", warped)
        return warped

    def get_well_positions(self, plate_img: np.ndarray) -> List[Tuple[int, int]]:
        """Calculate positions of all 96 wells.

        Args:
            plate_img (np.ndarray): Image of the plate.

        Returns:
            List[Tuple[int, int]]: List of well positions.
        """
        height, width = plate_img.shape[:2]

        # Standard 96-well plate is 8x12
        rows, cols = 8, 12

        # Calculate margins (10% of dimensions)
        margin_x = int(width * 0.1)
        margin_y = int(height * 0.1)

        # Calculate spacing between wells
        spacing_x = (width - 2 * margin_x) / (cols - 1)
        spacing_y = (height - 2 * margin_y) / (rows - 1)

        well_positions = []
        debug_img = plate_img.copy()

        for row in range(rows):
            for col in range(cols):
                x = int(margin_x + col * spacing_x)
                y = int(margin_y + row * spacing_y)
                well_positions.append((x, y))
                # Draw well position on debug image
                cv2.circle(debug_img, (x, y), 5, (0, 255, 0), -1)
                # Add well ID
                well_id = f"{chr(65 + row)}{col + 1}"
                cv2.putText(
                    debug_img,
                    well_id,
                    (x + 10, y),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.3,
                    (0, 255, 0),
                    1,
                )

        self.save_debug_image("06_well_positions", debug_img)
        return well_positions

    def analyze_wells(
        self, plate_img: np.ndarray, well_positions: List[Tuple[int, int]]
    ) -> Tuple[List[Dict[str, Tuple[int, int, int]]], np.ndarray]:
        """Get RGB values for each well.

        Args:
            plate_img (np.ndarray): Image of the plate.
            well_positions (List[Tuple[int, int]]): List of well positions.

        Returns:
            Tuple[List[Dict[str, Tuple[int, int, int]]], np.ndarray]: List of well RGB values and debug image.
        """
        results = []
        well_radius = int(min(plate_img.shape[:2]) * 0.02)
        debug_img = plate_img.copy()

        for i, (x, y) in enumerate(well_positions):
            # Ensure we don't go out of bounds
            y1 = max(0, y - well_radius)
            y2 = min(plate_img.shape[0], y + well_radius)
            x1 = max(0, x - well_radius)
            x2 = min(plate_img.shape[1], x + well_radius)

            # Draw sampling region
            cv2.rectangle(debug_img, (x1, y1), (x2, y2), (0, 255, 0), 1)

            # Extract region around well center
            well_region = plate_img[y1:y2, x1:x2]

            if well_region.size > 0:
                # Calculate average RGB values
                b, g, r = cv2.mean(well_region)[:3]
                well_id = f"{chr(65 + i // 12)}{i % 12 + 1}"
                results.append({"well": well_id, "rgb": (int(r), int(g), int(b))})

                # Add RGB values to debug image
                text = f"RGB:({int(r)},{int(g)},{int(b)})"
                cv2.putText(
                    debug_img,
                    text,
                    (x1, y1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.3,
                    (0, 255, 0),
                    1,
                )

        self.save_debug_image("07_analyzed_wells", debug_img)
        return results, debug_img

    def analyze_plate(self, image) -> Union[Optional[np.ndarray], np.ndarray]:
        """Main function to analyze the plate.

        Returns:
            Optional[np.ndarray]: 2D NumPy array of RGB entries or None if an error occurs.
        """
        try:
            # Capture frame from camera
            # print("Capturing frame from camera...")
            # image = self.capture_frame()

            # Detect plate
            print("Detecting plate...")
            plate_contour = self.detect_plate(image)

            # Transform perspective
            print("Transforming perspective...")
            plate_img = self.transform_perspective(image, plate_contour)

            # Get well positions
            print("Calculating well positions...")
            well_positions = self.get_well_positions(plate_img)

            # Analyze wells
            print("Analyzing wells...")
            results, debug_image = self.analyze_wells(plate_img, well_positions)

            # Transform results into a NumPy array of RGB entries
            rgb_array = np.empty((8, 12, 3), dtype=int)
            for result in results:
                well_id = result["well"]
                row = (
                    ord(well_id[0]) - 65
                )  # Convert letter to row index (A=0, B=1, ...)
                col = (
                    int(well_id[1:]) - 1
                )  # Convert number to column index (1=0, 2=1, ...)
                rgb_array[row, col] = result["rgb"]

            # Show well positions at the end
            # cv2.imshow("Well Positions", debug_image)
            # cv2.waitKey(0)
            # cv2.destroyAllWindows()

            return rgb_array, debug_image

        except Exception as e:
            print(f"Error analyzing plate: {str(e)}")
            return None, None


# # Example usage
# if __name__ == "__main__":
#     analyzer = WellPlateAnalyzer(camera_index=0, save_debug=True)
#     results = analyzer.analyze_plate()
#     if results is not None:
#         for result in results:
#             print(result)
