import { useEffect, useRef, useState } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import TalkingAvatar from "../components/TalkingAvatar";
import FormattedText from "../components/FormattedText";

import "./Avatar.css";

function Avatar() {
  // ==========================================
  // REFS
  // ==========================================

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const faceLandmarkerRef = useRef(null);
  const animationRef = useRef(null);

  const lastEmotionRef = useRef("");
  const lastEmotionReplyAtRef = useRef(0);
  const noFaceReplyRef = useRef(false);
  const recognitionRef = useRef(null);

  // ==========================================
  // STATES
  // ==========================================

  const [loading, setLoading] = useState(true);

  const [cameraStarted, setCameraStarted] =
    useState(false);

  const [faceDetected, setFaceDetected] =
    useState(false);

  const [emotion, setEmotion] =
    useState("Neutral");

  const [confidence, setConfidence] =
    useState(0);

  const [error, setError] =
    useState("");

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [isListening, setIsListening] =
    useState(false);

  const [userMessage, setUserMessage] =
    useState("");

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your AI Health Guardian. How are you feeling today?",
    },
  ]);

  // ==========================================
  // LOAD MEDIAPIPE
  // ==========================================

  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        setError("");

        const vision =
          await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
          );

        const landmarker =
          await FaceLandmarker.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath:
                  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",

                delegate: "GPU",
              },

              runningMode: "VIDEO",

              numFaces: 1,

              minFaceDetectionConfidence: 0.5,

              minFacePresenceConfidence: 0.5,

              minTrackingConfidence: 0.5,

              outputFaceBlendshapes: true,
            }
          );

        faceLandmarkerRef.current =
          landmarker;

        setLoading(false);

        console.log(
          "Face Landmarker loaded successfully"
        );
      } catch (err) {
        console.error(
          "Face model loading error:",
          err
        );

        setLoading(false);

        setError(
          "Unable to load face detection model."
        );
      }
    };

    loadModel();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }

      window.speechSynthesis?.cancel();

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // ==========================================
  // TEXT TO SPEECH
  // ==========================================

  const speak = (text) => {
    if (!("speechSynthesis" in window)) {
      console.log(
        "Speech synthesis not supported"
      );

      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(
      utterance
    );
  };

  // ==========================================
  // AI RESPONSE
  // ==========================================

  const getAIMessage = (currentEmotion) => {
    switch (currentEmotion) {
      case "Happy":
        return "You seem happy today! That's wonderful. Keep that positive energy going.";

      case "Sad":
        return "You seem a little low today. It's okay to have difficult moments. Take some time for yourself.";

      case "Angry":
        return "You seem a little tense. Try taking a few slow and deep breaths. I'm here with you.";

      case "Surprised":
        return "You look surprised! Is everything okay?";

      case "Neutral":
        return "You look calm today. How are you feeling?";

      default:
        return "Hello! I'm your AI Health Guardian. How are you feeling today?";
    }
  };

  // ==========================================
  // AVATAR REPLIES TO DETECTED FACE / EMOTION
  // ==========================================

  useEffect(() => {
    // Speak once when a face disappears, not every animation frame.
    if (!faceDetected || emotion === "No face") {
      if (cameraStarted && !noFaceReplyRef.current) {
        const message =
          "I can't see your face clearly. Please move into the camera view.";

        noFaceReplyRef.current = true;
        lastEmotionRef.current = "No face";

        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: message },
        ]);

        speak(message);
      }

      return;
    }

    noFaceReplyRef.current = false;

    // Neutral is shown in the UI but does not repeatedly trigger speech.
    if (emotion === "Neutral") {
      lastEmotionRef.current = emotion;
      return;
    }

    // Ignore repeated frames with the same expression.
    if (lastEmotionRef.current === emotion) {
      return;
    }

    // Prevent the avatar from speaking constantly when expressions change quickly.
    const now = Date.now();
    if (now - lastEmotionReplyAtRef.current < 5000) {
      lastEmotionRef.current = emotion;
      return;
    }

    lastEmotionRef.current = emotion;
    lastEmotionReplyAtRef.current = now;

    const message = getAIMessage(emotion);

    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: message,
      },
    ]);

    speak(message);
  }, [emotion, faceDetected, cameraStarted]);

  // ==========================================
  // START CAMERA
  // ==========================================

  const startCamera = async () => {
    try {
      setError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setError(
          "Camera is not supported by this browser."
        );

        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              width: 640,
              height: 480,
              facingMode: "user",
            },

            audio: false,
          }
        );

      if (!videoRef.current) {
        return;
      }

      videoRef.current.srcObject =
        stream;

      await videoRef.current.play();

      setCameraStarted(true);
      noFaceReplyRef.current = false;
      lastEmotionReplyAtRef.current = 0;

      detectFace();
    } catch (err) {
      console.error(
        "Camera error:",
        err
      );

      setError(
        "Camera permission denied or camera is unavailable."
      );
    }
  };

  // ==========================================
  // EMOTION DETECTION
  // ==========================================

  const detectEmotion = (blendshapes) => {
    if (
      !blendshapes ||
      blendshapes.length === 0
    ) {
      setEmotion("Neutral");
      setConfidence(0);

      return;
    }

    const categories =
      blendshapes[0].categories;

    const getScore = (name) => {
      const item = categories.find(
        (category) =>
          category.categoryName === name
      );

      return item ? item.score : 0;
    };

    // Smile
    const smileLeft =
      getScore("mouthSmileLeft");

    const smileRight =
      getScore("mouthSmileRight");

    // Frown
    const frownLeft =
      getScore("mouthFrownLeft");

    const frownRight =
      getScore("mouthFrownRight");

    // Angry
    const browDownLeft =
      getScore("browDownLeft");

    const browDownRight =
      getScore("browDownRight");

    // Surprise
    const jawOpen =
      getScore("jawOpen");

    const eyeWideLeft =
      getScore("eyeWideLeft");

    const eyeWideRight =
      getScore("eyeWideRight");

    const smile =
      (smileLeft + smileRight) / 2;

    const frown =
      (frownLeft + frownRight) / 2;

    const browDown =
      (browDownLeft + browDownRight) / 2;

    const eyeWide =
      (eyeWideLeft + eyeWideRight) / 2;

    // ======================================
    // HAPPY
    // ======================================

    if (smile > 0.25) {
      setEmotion("Happy");

      setConfidence(
        Math.min(
          98,
          Math.round(smile * 100)
        )
      );

      return;
    }

    // ======================================
    // SURPRISED
    // ======================================

    if (
      jawOpen > 0.20 &&
      eyeWide > 0.15
    ) {
      setEmotion("Surprised");

      const score =
        (jawOpen + eyeWide) / 2;

      setConfidence(
        Math.min(
          98,
          Math.round(score * 100)
        )
      );

      return;
    }

    // ======================================
    // ANGRY
    // ======================================

    if (
      browDown > 0.20 &&
      frown > 0.05
    ) {
      setEmotion("Angry");

      const score =
        (browDown + frown) / 2;

      setConfidence(
        Math.min(
          98,
          Math.round(score * 100)
        )
      );

      return;
    }

    // ======================================
    // SAD
    // ======================================

    if (frown > 0.12) {
      setEmotion("Sad");

      setConfidence(
        Math.min(
          98,
          Math.round(frown * 100)
        )
      );

      return;
    }

    // ======================================
    // NEUTRAL
    // ======================================

    setEmotion("Neutral");
    setConfidence(70);
  };

  // ==========================================
  // DRAW LANDMARKS
  // ==========================================

  const drawLandmarks = (
    ctx,
    landmarks,
    width,
    height
  ) => {
    if (!landmarks) return;

    ctx.fillStyle = "#65e6bd";

    landmarks.forEach((point) => {
      const x =
        point.x * width;

      const y =
        point.y * height;

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        1.5,
        0,
        2 * Math.PI
      );

      ctx.fill();
    });
  };

  // ==========================================
  // FACE DETECTION LOOP
  // ==========================================

  const detectFace = () => {
    if (
      !videoRef.current ||
      !faceLandmarkerRef.current
    ) {
      animationRef.current =
        requestAnimationFrame(
          detectFace
        );

      return;
    }

    const video =
      videoRef.current;

    if (
      video.readyState >= 2 &&
      video.videoWidth > 0
    ) {
      try {
        const results =
          faceLandmarkerRef.current.detectForVideo(
            video,
            performance.now()
          );

        if (
          results.faceLandmarks &&
          results.faceLandmarks.length > 0
        ) {
          const landmarks =
            results.faceLandmarks[0];

          setFaceDetected(true);

          const canvas =
            canvasRef.current;

          if (canvas) {
            const ctx =
              canvas.getContext("2d");

            canvas.width =
              video.videoWidth;

            canvas.height =
              video.videoHeight;

            ctx.clearRect(
              0,
              0,
              canvas.width,
              canvas.height
            );

            drawLandmarks(
              ctx,
              landmarks,
              canvas.width,
              canvas.height
            );
          }

          if (
            results.faceBlendshapes &&
            results.faceBlendshapes
              .length > 0
          ) {
            detectEmotion(
              results.faceBlendshapes
            );
          }
        } else {
          setFaceDetected(false);

          setEmotion("No face");

          setConfidence(0);

          const canvas =
            canvasRef.current;

          if (canvas) {
            const ctx =
              canvas.getContext("2d");

            ctx.clearRect(
              0,
              0,
              canvas.width,
              canvas.height
            );
          }
        }
      } catch (err) {
        console.error(
          "Face detection error:",
          err
        );
      }
    }

    animationRef.current =
      requestAnimationFrame(
        detectFace
      );
  };

  // ==========================================
  // STOP CAMERA
  // ==========================================

  const stopCamera = () => {
    if (
      videoRef.current?.srcObject
    ) {
      const tracks =
        videoRef.current.srcObject.getTracks();

      tracks.forEach((track) =>
        track.stop()
      );

      videoRef.current.srcObject =
        null;
    }

    if (
      animationRef.current
    ) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;
    }

    setCameraStarted(false);

    setFaceDetected(false);

    setEmotion("Neutral");

    setConfidence(0);

    lastEmotionRef.current = "";
    lastEmotionReplyAtRef.current = 0;
    noFaceReplyRef.current = false;

    const canvas =
      canvasRef.current;

    if (canvas) {
      const ctx =
        canvas.getContext("2d");

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }
  };

  // ==========================================
  // MICROPHONE / SPEECH RECOGNITION
  // ==========================================

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported. Please use Chrome."
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const text =
        event.results[0][0].transcript;

      setUserMessage(text);
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current =
      recognition;

    recognition.start();
  };

  // ==========================================
  // AI CHAT RESPONSE
  // ==========================================

  const generateAIResponse = (
    text
  ) => {
    const message =
      text.toLowerCase();

    if (
      message.includes("sad") ||
      message.includes("depressed") ||
      message.includes("low")
    ) {
      return "I'm sorry you're feeling low. Take a moment to breathe and be kind to yourself. If these feelings continue, consider talking to someone you trust.";
    }

    if (
      message.includes("happy") ||
      message.includes("good")
    ) {
      return "That's great to hear! Keep taking care of yourself and maintain those positive habits.";
    }

    if (
      message.includes("stress") ||
      message.includes("stressed")
    ) {
      return "Stress can build up over time. Try a few slow breaths, drink some water, and take a short break if you can.";
    }

    if (
      message.includes("hello") ||
      message.includes("hi")
    ) {
      return "Hello! I'm your AI Health Guardian. I'm here to support your wellbeing.";
    }

    if (
      message.includes("headache")
    ) {
      return "I'm sorry you're dealing with a headache. Rest, hydration, and a comfortable environment may help. If it is severe or persistent, consider speaking with a healthcare professional.";
    }

    return "Thanks for sharing that with me. I'm here to listen and support your wellbeing.";
  };

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = () => {
    const text =
      userMessage.trim();

    if (!text) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text,
      },
    ]);

    setUserMessage("");

    setTimeout(() => {
      const response =
        generateAIResponse(text);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: response,
        },
      ]);

      speak(response);
    }, 500);
  };

  // ==========================================
  // ENTER KEY
  // ==========================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  // ==========================================
  // EMOTION ICON
  // ==========================================

  const getEmotionIcon = () => {
    switch (emotion) {
      case "Happy":
        return "😊";

      case "Sad":
        return "😔";

      case "Angry":
        return "😠";

      case "Surprised":
        return "😮";

      case "Neutral":
        return "😐";

      case "No face":
        return "👤";

      default:
        return "🙂";
    }
  };

  // ==========================================
  // TALK ABOUT CURRENT EMOTION
  // ==========================================

  const talkAboutEmotion = () => {
    const message =
      getAIMessage(emotion);

    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: message,
      },
    ]);

    speak(message);
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="avatar-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="avatar-page-header">

        <div>
          <span className="avatar-label">
            AI HEALTH AVATAR
          </span>

          <h1>
            Meet Your AI Health Guardian
          </h1>

          <p>
            An intelligent companion that
            understands your expressions and
            talks with you.
          </p>
        </div>

        <div
          className={
            faceDetected
              ? "face-status detected"
              : "face-status"
          }
        >
          <span className="status-dot"></span>

          {faceDetected
            ? "Face Detected"
            : "Waiting for Face"}
        </div>

      </div>

      {/* ======================================
          MAIN
      ====================================== */}

      <div className="avatar-container">

        {/* ====================================
            REAL AVATAR
        ==================================== */}

        <div className="avatar-section">

          <div
            className={
              isSpeaking
                ? "real-avatar speaking"
                : "real-avatar"
            }
          >
            <div className="avatar-glow"></div>

            <div
              className="avatar-3d"
              style={{
                width: "100%",
                height: "clamp(380px, 52vh, 520px)",
                overflow: "hidden",
              }}
            >
              <Canvas
                dpr={[1, 1.5]}
                camera={{
                  // Pulled back so the full avatar fits inside the card.
                  position: [0, 0.35, 6],
                  fov: 34,
                }}
                gl={{
                  antialias: true,
                  alpha: true,
                }}
              >
                <ambientLight intensity={1.8} />

                <directionalLight
                  position={[3, 5, 4]}
                  intensity={2}
                />

                <directionalLight
                  position={[-3, 2, 3]}
                  intensity={1}
                />

                <group
                  // Smaller and slightly lower to match the card layout.
                  scale={0.58}
                  position={[0, -0.55, 0]}
                >
                  <TalkingAvatar isSpeaking={isSpeaking} />
                </group>

                <Environment preset="city" />
              </Canvas>
            </div>

            {isSpeaking && (
              <div className="speaking-ring">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>

          <div className="guardian-status">
            <span className="status-dot"></span>
            AI Guardian Online
          </div>

          <h2>LifeCare Guardian</h2>

          <p>
            Your AI wellness companion can observe facial expressions,
            talk with you and provide supportive wellness guidance.
          </p>

          <div className="avatar-emotion">
            <div className="avatar-emotion-icon">
              {getEmotionIcon()}
            </div>

            <div>
              <small>Current Expression</small>
              <strong>{emotion}</strong>
            </div>
          </div>

          <button
            className={
              isSpeaking
                ? "talk-button speaking-button"
                : "talk-button"
            }
            onClick={talkAboutEmotion}
          >
            {isSpeaking
              ? "🔊 Speaking..."
              : "🔊 Talk to Me"}
          </button>

        </div>

        {/* ====================================
            RIGHT PANEL
        ==================================== */}

        <div className="avatar-chat">

          {/* HEADER */}

          <div className="chat-header">

            <div className="chat-icon">
              🤖
            </div>

            <div>

              <strong>
                AI Vision & Conversation
              </strong>

              <small>
                Real-time facial analysis
              </small>

            </div>

            <div className="online-indicator">
              <span></span>
              Online
            </div>

          </div>

          {/* CHAT CONTENT */}

          <div className="chat-messages">

            {/* CAMERA */}

            <div className="camera-container">

              <video
                ref={videoRef}
                className="camera-video"
                autoPlay
                muted
                playsInline
              />

              <canvas
                ref={canvasRef}
                className="face-landmarks"
              />

              {!cameraStarted && (
                <div className="camera-placeholder">

                  <div className="camera-icon">
                    📷
                  </div>

                  <strong>
                    Camera is not active
                  </strong>

                  <small>
                    Start your camera to allow
                    facial expression analysis.
                  </small>

                </div>
              )}

              {cameraStarted && (
                <div className="camera-status">

                  <span
                    className={
                      faceDetected
                        ? "camera-dot detected"
                        : "camera-dot"
                    }
                  ></span>

                  {faceDetected
                    ? "Face detected"
                    : "Looking for face..."}

                </div>
              )}

            </div>

            {/* ANALYSIS CARD */}

            <div className="analysis-card">

              <div className="analysis-title">

                <span>
                  LIVE ANALYSIS
                </span>

                <span className="live-badge">
                  ● LIVE
                </span>

              </div>

              <div className="emotion-result">

                <div className="emotion-icon">
                  {getEmotionIcon()}
                </div>

                <div>

                  <small>
                    Current Expression
                  </small>

                  <h3>
                    {emotion}
                  </h3>

                </div>

              </div>

              <div className="confidence">

                <div className="confidence-header">

                  <span>
                    Detection Confidence
                  </span>

                  <strong>
                    {confidence}%
                  </strong>

                </div>

                <div className="confidence-bar">

                  <div
                    style={{
                      width:
                        `${confidence}%`,
                    }}
                  ></div>

                </div>

              </div>

            </div>

            {/* CHAT MESSAGES */}

            <div className="conversation">

              {messages.map(
                (message, index) => (
                  <div
                    key={index}
                    className={
                      message.sender === "ai"
                        ? "message ai-message"
                        : "message user-message"
                    }
                  >

                    <span>
                      {message.sender === "ai"
                        ? "🤖"
                        : "👤"}
                    </span>

                    <div>
                      {message.sender === "ai" ? (
                        <FormattedText content={message.text} />
                      ) : (
                        message.text
                      )}

                      {message.sender ===
                        "ai" && (
                        <button
                          className="speak-button"
                          onClick={() =>
                            speak(
                              message.text
                            )
                          }
                          title="Speak"
                        >
                          🔊
                        </button>
                      )}
                    </div>

                  </div>
                )
              )}

            </div>

            {/* MODEL LOADING */}

            {loading && (
              <div className="system-message">
                🔄 Loading AI vision model...
              </div>
            )}

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

          </div>

          {/* ==================================
              INPUT
          ================================== */}

          <div className="chat-input">

            <input
              type="text"
              value={userMessage}
              placeholder="Talk to your AI Guardian..."
              onChange={(e) =>
                setUserMessage(
                  e.target.value
                )
              }
              onKeyDown={handleKeyDown}
            />

            {/* MICROPHONE */}

            <button
              className={
                isListening
                  ? "mic-button listening"
                  : "mic-button"
              }
              onClick={startListening}
              title="Speak"
            >
              🎙️
            </button>

            {/* SEND */}

            <button
              className="send-button"
              onClick={sendMessage}
              disabled={
                !userMessage.trim()
              }
              title="Send"
            >
              ➤
            </button>

          </div>

          {/* CAMERA BUTTON */}

          <div className="camera-controls">

            {!cameraStarted ? (
              <button
                className="start-camera"
                onClick={startCamera}
                disabled={loading}
              >
                📷 Start Camera
              </button>
            ) : (
              <button
                className="stop-camera"
                onClick={stopCamera}
              >
                ⏹ Stop Camera
              </button>
            )}

          </div>

        </div>

      </div>

      {/* ======================================
          HEALTH FEATURES
      ====================================== */}

      <div className="health-features">

        <div className="health-card">

          <span>😊</span>

          <div>
            <strong>
              Emotion Detection
            </strong>

            <small>
              Real-time expression analysis
            </small>
          </div>

        </div>

        <div className="health-card">

          <span>🗣️</span>

          <div>
            <strong>
              Voice Conversation
            </strong>

            <small>
              Talk naturally with your guardian
            </small>
          </div>

        </div>

        <div className="health-card">

          <span>🤖</span>

          <div>
            <strong>
              AI Companion
            </strong>

            <small>
              Supportive wellness interaction
            </small>
          </div>

        </div>

        <div className="health-card emergency">

          <span>🆘</span>

          <div>
            <strong>
              Emergency Support
            </strong>

            <small>
              Get help when you need it
            </small>
          </div>

        </div>

      </div>

      {/* DISCLAIMER */}

      <div className="avatar-note">

        ⚠️ Facial-expression analysis is
        experimental and should not be used
        as a medical diagnosis.

      </div>

    </div>
  );
}

export default Avatar;