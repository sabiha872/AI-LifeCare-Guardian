import { useEffect, useRef, useState } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

function LiveFaceCamera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [status, setStatus] = useState("Starting...");
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    let stream = null;
    let animationFrame = null;
    let faceLandmarker = null;

    const start = async () => {
      try {
        // =========================
        // 1. CAMERA
        // =========================
        setStatus("Requesting camera...");

        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        console.log("Camera OK");

        videoRef.current.srcObject = stream;

        await videoRef.current.play();

        console.log("Video OK");

        // =========================
        // 2. LOAD MEDIAPIPE WASM
        // =========================
        setStatus("Loading face detection AI...");

        const vision = await FilesetResolver.forVisionTasks(
          "/mediapipe/wasm"
        );

        console.log("WASM loaded");

        // =========================
        // 3. LOAD FACE MODEL
        // =========================
        faceLandmarker =
          await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "/mediapipe/models/face_landmarker.task",

              delegate: "CPU",
            },

            runningMode: "VIDEO",

            numFaces: 1,

            minFaceDetectionConfidence: 0.5,

            minFacePresenceConfidence: 0.5,

            minTrackingConfidence: 0.5,
          });

        console.log("Face model loaded");

        setStatus("Looking for your face...");

        // =========================
        // 4. DETECTION LOOP
        // =========================

        const detect = () => {
          if (!videoRef.current || !faceLandmarker) {
            return;
          }

          if (videoRef.current.readyState >= 2) {
            const results =
              faceLandmarker.detectForVideo(
                videoRef.current,
                performance.now()
              );

            const found =
              results.faceLandmarks &&
              results.faceLandmarks.length > 0;

            setFaceDetected(found);

            if (found) {
              setStatus("Face detected ✓");
              drawLandmarks(results.faceLandmarks[0]);
            } else {
              setStatus("Looking for your face...");
              clearCanvas();
            }
          }

          animationFrame =
            requestAnimationFrame(detect);
        };

        detect();

      } catch (error) {
        console.error("FACE AVATAR ERROR:", error);

        setStatus(
          "ERROR: " +
          (error?.message || "Unknown error")
        );
      }
    };

    start();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      if (faceLandmarker) {
        faceLandmarker.close();
      }

      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const drawLandmarks = (landmarks) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "#00ff88";

    landmarks.forEach((point) => {
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        2,
        0,
        Math.PI * 2
      );

      ctx.fill();
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  };

  return (
    <div
      className="live-camera"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "700px",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          display: "block",
          transform: "scaleX(-1)",
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          transform: "scaleX(-1)",
        }}
      />

      <div
        style={{
          padding: "12px",
          marginTop: "10px",
          background: "#111",
          color: "white",
          borderRadius: "8px",
        }}
      >
        <span
          style={{
            color: faceDetected
              ? "#00ff88"
              : "#ffaa00",
          }}
        >
          ●
        </span>{" "}
        {status}
      </div>
    </div>
  );
}

export default LiveFaceCamera;