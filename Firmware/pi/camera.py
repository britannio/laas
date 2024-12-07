import io
import picamera
from flask import Flask, Response, send_file
from PIL import Image

app = Flask(__name__)

def capture_image():
    """Capture an image using Raspberry Pi camera."""
    # Create a stream to store the image
    stream = io.BytesIO()
    
    # Initialize the camera
    with picamera.PiCamera() as camera:
        # Optional: configure camera settings
        camera.resolution = (640, 480)
        camera.brightness = 50
        
        # Capture the image to the stream
        camera.capture(stream, format='jpeg')
    
    # Reset the stream's position to the beginning
    stream.seek(0)
    return stream

@app.route('/')
def home():
    """Render a simple HTML page with the image."""
    return '''
    <html>
        <body>
            <h1>Raspberry Pi Camera Server</h1>
            <img src="/image" alt="Raspberry Pi Camera">
        </body>
    </html>
    '''

@app.route('/image')
def image():
    """Serve the captured image."""
    # Capture the image
    image_stream = capture_image()
    
    # Send the image as a file response
    return send_file(image_stream, 
                     mimetype='image/jpeg', 
                     as_attachment=False)

@app.route('/image.jpg')
def image_stream():
    """Stream the image directly."""
    def generate():
        stream = capture_image()
        yield stream.getvalue()
    
    return Response(generate(), mimetype='image/jpeg')

if __name__ == '__main__':
    # Run the server on all available interfaces
    # Use port 5000 by default
    app.run(host='0.0.0.0', port=5000, debug=True)