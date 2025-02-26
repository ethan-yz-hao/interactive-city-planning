/* Tutorial: QR Code Detection
 * This module handles all the QR code detection and processing using OpenCV.js
 * It includes video capture, frame processing, and QR code position calculation.
 */

let videoCanvas, videoCtx, cvImg;

async function loadOpenCVJS() {
  return new Promise((resolve, reject) => {
    const opencvjs = document.createElement("script");
    opencvjs.src = "https://docs.opencv.org/4.9.0/opencv.js";
    opencvjs.onload = () => (cv["onRuntimeInitialized"] = resolve);
    opencvjs.onerror = () => reject(new Error("Failed to load OpenCV.js"));
    document.body.appendChild(opencvjs);
  });
}

async function initializeVideoAndCanvas() {
  try {
    await loadOpenCVJS();
    videoCanvas = document.getElementById("video-canvas");
    videoCtx = videoCanvas.getContext("2d");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1024, height: 768 },
    });
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();
    setInterval(() => captureFrame(video), 20);
  } catch (err) {
    console.error("Video initialization error:", err);
  }
}

function captureFrame(video) {
  videoCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
  cvImg = cv.imread(videoCanvas);
  const qcd = new cv.QRCodeDetector();
  const decodedInfo = new cv.StringVector();
  const points = new cv.Mat();
  const straightQrCode = new cv.MatVector();

  if (qcd.detectAndDecodeMulti(cvImg, decodedInfo, points, straightQrCode)) {
    for (let i = 0; i < decodedInfo.size(); i++) {
      const p = points.row(i).data32F;
      const center = calculateCenter(p);
      updateQRPosition(center);
      drawQRCodeOutline(cvImg, p);
    }
    updateLayers();
  }

  cv.imshow("video-canvas", cvImg);
  [qcd, decodedInfo, points, straightQrCode, cvImg].forEach((item) =>
    item.delete()
  );
}

function calculateCenter(points) {
  return {
    x: (points[0] + points[2] + points[4] + points[6]) / 4,
    y: (points[1] + points[3] + points[5] + points[7]) / 4,
  };
}

function updateQRPosition(center) {
  if (!manualControl) {
    QRPosition[0] =
      initialQRPosition[0] +
      (center.x - videoCanvas.width / 2) * movementRadius;
    QRPosition[1] =
      initialQRPosition[1] +
      (center.y - videoCanvas.height / 2) * movementRadius;
  }
}

function drawQRCodeOutline(img, points) {
  const pointMatVector = new cv.MatVector();
  pointMatVector.push_back(cv.matFromArray(4, 1, cv.CV_32SC2, points));
  cv.polylines(
    img,
    pointMatVector,
    true,
    new cv.Scalar(0, 255, 0, 255),
    2,
    cv.LINE_AA
  );
  pointMatVector.delete();
}
