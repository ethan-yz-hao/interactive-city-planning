import cv2
import numpy as np
import asyncio
import websockets
import json
from queue import Queue
from threading import Thread
from typing import List, Dict, Any

# Constants
WS_HOST = "localhost"
WS_PORT = 8765
WINDOW_WIDTH = 1000  # Smaller window width
WINDOW_HEIGHT = 1000  # Smaller window height

# Queue to hold QR code data
qr_queue: Queue = Queue()


async def websocket_server(websocket, path):
    while True:
        if not qr_queue.empty():
            data = qr_queue.get()
            data = convert_to_json_serializable(data)

            await websocket.send(json.dumps(data))
        else:
            await asyncio.sleep(0.1)


async def start_server():
    server = await websockets.serve(websocket_server, WS_HOST, WS_PORT)
    print(f"WebSocket server started on ws://{WS_HOST}:{WS_PORT}")
    await server.wait_closed()


def convert_to_json_serializable(obj):
    if isinstance(obj, np.float32):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: convert_to_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_json_serializable(i) for i in obj]
    return obj


def run_websocket_server(loop: asyncio.AbstractEventLoop):
    asyncio.set_event_loop(loop)
    loop.run_until_complete(start_server())


def calculate_rotation_and_scale(points):
    # Calculate rotation
    vector = points[1] - points[0]
    angle = np.arctan2(vector[1], vector[0])

    # Calculate scale (using the width of the QR code)
    width = np.linalg.norm(points[1] - points[0])

    return angle, width


def process_image(image: np.ndarray) -> np.ndarray:
    # Split the image into its color channels
    b, g, r = cv2.split(image)

    # Create a CLAHE object
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

    # Apply CLAHE to each channel
    b = clahe.apply(b)
    g = clahe.apply(g)
    r = clahe.apply(r)

    # Merge the channels back together
    contrast_image = cv2.merge((b, g, r))

    qcd = cv2.QRCodeDetector()
    ret_qr, decoded_info, points, _ = qcd.detectAndDecodeMulti(contrast_image)

    qr_data: List[Dict[str, Any]] = []
    if ret_qr:
        for info, point in zip(decoded_info, points):
            if info:
                print(f"Decoded info: {info} at {point}")
                cv2.putText(contrast_image, info, (int(point[0][0]), int(point[0][1] - 10)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2, cv2.LINE_AA)

                rotation, scale = calculate_rotation_and_scale(point)

                qr_data.append({
                    "info": info,
                    "location": point.tolist(),
                    "rotation": rotation,
                    "scale": scale
                })
            contrast_image = cv2.polylines(
                contrast_image, [point.astype(int)], True, (0, 0, 255), 2)

    if qr_data:
        qr_queue.put(qr_data)

    return contrast_image


def main():
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open video.")
        return

    # Set the capture resolution
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, WINDOW_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, WINDOW_HEIGHT)

    websocket_loop = asyncio.new_event_loop()
    websocket_thread = Thread(
        target=run_websocket_server, args=(websocket_loop,))
    websocket_thread.start()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to capture image.")
                break

            processed_frame = process_image(frame)

            # Resize the frame to the desired window size
            resized_frame = cv2.resize(
                processed_frame, (WINDOW_WIDTH, WINDOW_HEIGHT))

            cv2.imshow('QR Code Scanner', resized_frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()
        websocket_loop.call_soon_threadsafe(websocket_loop.stop)
        websocket_thread.join()


if __name__ == "__main__":
    main()
