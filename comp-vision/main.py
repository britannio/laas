import cv2
import numpy as np
import os

class WellPlateAnalyzer:
    def __init__(self, image_path):
        self.image_path = image_path
        # Create debug directory if it doesn't exist
        self.debug_dir = "debug_images"
        if not os.path.exists(self.debug_dir):
            os.makedirs(self.debug_dir)

    def save_debug_image(self, name, image):
        """Save debug image to file"""
        path = os.path.join(self.debug_dir, f"{name}.png")
        cv2.imwrite(path, image)
        print(f"Saved debug image: {path}")

    def load_image(self):
        """Load image from file"""
        image = cv2.imread(self.image_path)
        if image is None:
            raise Exception(f"Failed to load image: {self.image_path}")
        return image

    def detect_plate(self, image):
        """Detect the 96-well plate using the black sharpie outline"""
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        self.save_debug_image("01_grayscale", gray)

        # Apply adaptive thresholding to handle varying lighting
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, 21, 10
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

    def transform_perspective(self, image, points):
        """Transform the perspective to get a top-down view"""
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
        width = 800   # Fixed width for consistent results
        height = int(width * (2/3))  # Maintain typical 96-well plate aspect ratio

        # Create destination points
        dst = np.array([
            [0, 0],
            [width - 1, 0],
            [width - 1, height - 1],
            [0, height - 1]
        ], dtype="float32")

        # Calculate perspective transform matrix
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(image, M, (width, height))

        self.save_debug_image("05_transformed", warped)
        return warped

    def get_well_positions(self, plate_img):
        """Calculate positions of all 96 wells"""
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
                well_id = f'{chr(65 + row)}{col + 1}'
                cv2.putText(debug_img, well_id, (x + 10, y),
                          cv2.FONT_HERSHEY_SIMPLEX, 0.3, (0, 255, 0), 1)

        self.save_debug_image("06_well_positions", debug_img)
        return well_positions

    def analyze_wells(self, plate_img, well_positions):
        """Get RGB values for each well"""
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
                well_id = f'{chr(65 + i//12)}{i%12 + 1}'
                results.append({
                    'well': well_id,
                    'rgb': (int(r), int(g), int(b))
                })

                # Add RGB values to debug image
                text = f"RGB:({int(r)},{int(g)},{int(b)})"
                cv2.putText(debug_img, text, (x1, y1-5),
                          cv2.FONT_HERSHEY_SIMPLEX, 0.3, (0, 255, 0), 1)

        self.save_debug_image("07_analyzed_wells", debug_img)
        return results

    def analyze_plate(self):
        """Main function to analyze the plate"""
        try:
            # Load image
            print("Loading image...")
            image = self.load_image()

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
            results = self.analyze_wells(plate_img, well_positions)

            return results

        except Exception as e:
            print(f"Error analyzing plate: {str(e)}")
            return None

# Example usage
if __name__ == "__main__":
    analyzer = WellPlateAnalyzer("demo.png")
    results = analyzer.analyze_plate()
    if results:
        print("\nResults:")
        for well in results:
            print(f"Well {well['well']}: RGB = {well['rgb']}")
