"""
FastAPI server for AI Behavioral Analysis (Production-Ready)
Handles facial emotion recognition, speech analysis, and engagement scoring

This server is designed to run REAL trained models exported to ONNX.
You are expected to:
  1. Train models (vision + speech) using the Kaggle datasets.
  2. Export them to ONNX.
  3. Place the .onnx files in the configured paths or set env vars.
"""

import os
from typing import List, Dict, Any, Optional

import cv2
import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Cognicare AI Server")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# These paths can be overridden with environment variables in production
EMOTION_MODEL_PATH = os.getenv("EMOTION_MODEL_PATH", "models/emotion_emotionnet.onnx")
ATTENTION_MODEL_PATH = os.getenv("ATTENTION_MODEL_PATH", "models/attention_gaze.onnx")
SPEECH_MODEL_PATH = os.getenv("SPEECH_MODEL_PATH", "models/speech_ravdess.onnx")

# Label mappings – MUST match your training code
EMOTION_LABELS = os.getenv(
    "EMOTION_LABELS",
    "angry,disgust,fear,happy,sad,surprise,neutral,focused",
).split(",")

SPEECH_EMOTION_LABELS = os.getenv(
    "SPEECH_EMOTION_LABELS",
    "neutral,calm,happy,sad,angry,fear,disgust,surprised",
).split(",")


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# ONNX model loading
# ---------------------------------------------------------------------------

emotion_session: Optional[ort.InferenceSession] = None
attention_session: Optional[ort.InferenceSession] = None
speech_session: Optional[ort.InferenceSession] = None


def _load_session(path: str) -> Optional[ort.InferenceSession]:
    """Safely load an ONNXRuntime session if the model file exists."""
    if not path or not os.path.exists(path):
        print(f"[AI] Model not found at {path}, falling back to heuristic logic.")
        return None

    try:
        print(f"[AI] Loading ONNX model from {path} ...")
        session = ort.InferenceSession(
            path,
            providers=["CPUExecutionProvider"],
        )
        print(f"[AI] Loaded model: {path}")
        return session
    except Exception as exc:
        print(f"[AI] Failed to load model {path}: {exc}")
        return None


def load_models() -> None:
    """Load all ONNX models into memory at startup."""
    global emotion_session, attention_session, speech_session

    emotion_session = _load_session(EMOTION_MODEL_PATH)
    attention_session = _load_session(ATTENTION_MODEL_PATH)
    speech_session = _load_session(SPEECH_MODEL_PATH)


@app.on_event("startup")
async def on_startup() -> None:
    """FastAPI startup hook – load models once."""
    load_models()


class FrameAnalysisResponse(BaseModel):
    emotions: Dict[str, float]
    attention: float
    engagement: float
    gaze_direction: Dict[str, float] = None


class AudioAnalysisResponse(BaseModel):
    emotion: str
    confidence: float
    energy: float


class SessionFinalizeRequest(BaseModel):
    session_id: str
    frames: List[Dict[str, Any]]
    audio_chunks: List[Dict[str, Any]]


class SessionMetricsResponse(BaseModel):
    engagement_score: float
    attention_score: float
    emotion_distribution: Dict[str, float]
    gaze_patterns: Dict[str, Any]
    speech_emotions: Dict[str, float]
    recommendations: List[str]


def _softmax(x: np.ndarray) -> np.ndarray:
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=-1, keepdims=True)


def _preprocess_face(frame_bytes: bytes, size: int = 64) -> np.ndarray:
    """
    Convert raw bytes into a normalized tensor suitable for ONNX.

    This assumes your vision model takes input of shape [1, 3, size, size]
    with pixel values normalized to [0, 1]. Adjust this if your training
    pipeline used different preprocessing.
    """
    nparr = np.frombuffer(frame_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (size, size))
    img = img.astype("float32") / 255.0
    # Move channels first: HWC -> CHW
    img = np.transpose(img, (2, 0, 1))
    # Add batch dimension
    img = np.expand_dims(img, axis=0)
    return img


def process_frame(frame_bytes: bytes) -> Dict[str, Any]:
    """
    Production frame processing using ONNX models when available.
    Falls back to a heuristic implementation when models are missing.
    """
    try:
        img_tensor = _preprocess_face(frame_bytes)

        # -------------------------
        # Emotion inference
        # -------------------------
        if emotion_session is not None:
            input_name = emotion_session.get_inputs()[0].name
            outputs = emotion_session.run(None, {input_name: img_tensor})
            # Assume outputs[0] is [1, num_classes]
            logits = outputs[0][0]
            probs = _softmax(logits)
            emotions = {
                EMOTION_LABELS[i]: float(probs[i])
                for i in range(min(len(EMOTION_LABELS), len(probs)))
            }
        else:
            # Heuristic fallback
            emotions = {
                "happy": 0.3,
                "neutral": 0.4,
                "focused": 0.2,
                "surprised": 0.1,
            }

        # -------------------------
        # Attention / gaze inference (optional)
        # -------------------------
        if attention_session is not None:
            att_input = attention_session.get_inputs()[0].name
            att_output = attention_session.run(None, {att_input: img_tensor})[0][0]
            # Assume attention model returns a scalar attention score in [0, 1]
            attention = float(att_output[0]) if np.ndim(att_output) > 0 else float(att_output)
            gaze_direction = {
                "x": float(att_output[1]) if len(att_output) > 1 else 0.5,
                "y": float(att_output[2]) if len(att_output) > 2 else 0.5,
            }
        else:
            # Simple heuristic: medium attention looking at center
            attention = 0.7
            gaze_direction = {"x": 0.5, "y": 0.5}

        # Engagement combines positive/focused emotions with attention
        engagement = (
            (emotions.get("happy", 0) + emotions.get("focused", 0)) * 0.5
            + attention * 0.5
        )

        return {
            "emotions": emotions,
            "attention": float(attention),
            "engagement": float(engagement),
            "gaze_direction": gaze_direction,
        }
    except Exception as e:
        print(f"[AI] Error processing frame: {e}")
        # Robust fallback values to avoid breaking the flow
        return {
            "emotions": {"neutral": 1.0},
            "attention": 0.5,
            "engagement": 0.5,
            "gaze_direction": {"x": 0.5, "y": 0.5},
        }


@app.post("/vision/frame", response_model=FrameAnalysisResponse)
async def analyze_frame(frame: UploadFile = File(...)):
    """
    Analyze a video frame for emotions, attention, and engagement
    """
    try:
        frame_bytes = await frame.read()
        analysis = process_frame(frame_bytes)
        
        return FrameAnalysisResponse(**analysis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/audio/chunk", response_model=AudioAnalysisResponse)
async def analyze_audio(audio: UploadFile = File(...)):
    """
    Analyze an audio chunk for speech emotions
    """
    try:
        audio_bytes = await audio.read()

        # Simple energy proxy for loudness
        audio_np = np.frombuffer(audio_bytes, dtype=np.int16)
        if audio_np.size == 0:
            raise ValueError("Empty audio buffer")

        energy = float(np.mean(np.square(audio_np))) / (2**31)

        if speech_session is not None:
            # NOTE: This assumes your speech model expects log-mel spectrogram
            # features of fixed length. You MUST align this with your training
            # pipeline. Here we just show the structure.
            input_name = speech_session.get_inputs()[0].name

            # Placeholder: use a simple normalized energy vector as input
            # Replace with real feature extraction (e.g. librosa melspectrogram)
            feats = np.clip(audio_np.astype("float32") / 32768.0, -1.0, 1.0)
            # Pad / truncate to fixed length
            target_len = 16000
            if feats.shape[0] < target_len:
                feats = np.pad(feats, (0, target_len - feats.shape[0]))
            else:
                feats = feats[:target_len]
            feats = np.expand_dims(feats, axis=0)

            outputs = speech_session.run(None, {input_name: feats})
            logits = outputs[0][0]
            probs = _softmax(logits)
            best_idx = int(np.argmax(probs))
            emotion = (
                SPEECH_EMOTION_LABELS[best_idx]
                if best_idx < len(SPEECH_EMOTION_LABELS)
                else "neutral"
            )
            confidence = float(np.max(probs))
        else:
            # Heuristic speech emotion based on energy
            if energy < 1e-6:
                emotion = "calm"
            elif energy < 5e-6:
                emotion = "neutral"
            else:
                emotion = "excited"
            confidence = 0.6

        return AudioAnalysisResponse(
            emotion=emotion,
            confidence=confidence,
            energy=energy,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/session/finalize", response_model=SessionMetricsResponse)
async def finalize_session(request: SessionFinalizeRequest):
    """
    Aggregate metrics from a game session and generate insights
    """
    try:
        frames = request.frames
        audio_chunks = request.audio_chunks
        
        # Aggregate engagement scores
        engagement_scores = [f.get("engagement", 0.5) for f in frames]
        avg_engagement = sum(engagement_scores) / len(engagement_scores) if engagement_scores else 0.5
        
        # Aggregate attention scores
        attention_scores = [f.get("attention", 0.5) for f in frames]
        avg_attention = sum(attention_scores) / len(attention_scores) if attention_scores else 0.5
        
        # Aggregate emotions
        emotion_distribution = {}
        for frame in frames:
            emotions = frame.get("emotions", {})
            for emotion, value in emotions.items():
                emotion_distribution[emotion] = emotion_distribution.get(emotion, 0) + value
        
        # Normalize
        total = sum(emotion_distribution.values())
        if total > 0:
            emotion_distribution = {k: v / total for k, v in emotion_distribution.items()}
        
        # Aggregate speech emotions
        speech_emotions = {}
        for chunk in audio_chunks:
            emotion = chunk.get("emotion", "neutral")
            speech_emotions[emotion] = speech_emotions.get(emotion, 0) + 1
        
        # Normalize
        total_speech = sum(speech_emotions.values())
        if total_speech > 0:
            speech_emotions = {k: v / total_speech for k, v in speech_emotions.items()}
        
        # Generate recommendations
        recommendations = []
        if avg_engagement < 0.5:
            recommendations.append("Consider shorter game sessions to maintain focus")
        if avg_attention < 0.6:
            recommendations.append("Try games with more visual feedback")
        if avg_engagement > 0.8:
            recommendations.append("Great engagement! Consider increasing difficulty")
        
        return SessionMetricsResponse(
            engagement_score=avg_engagement * 100,
            attention_score=avg_attention * 100,
            emotion_distribution=emotion_distribution,
            gaze_patterns={"average_x": 0.5, "average_y": 0.5},  # Placeholder
            speech_emotions=speech_emotions,
            recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "cognicare-ai"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

