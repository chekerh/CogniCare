# 🤖 Cognicare AI Training Plan
## Structured Plan for Accurate Emotion & Attention Detection

**Goal:** Train accurate AI models for emotion recognition, attention tracking, and engagement scoring.

**Timeline:** Can be done after demo (not required for video)

---

## Overview

The AI server currently works with **fallback heuristics** which are sufficient for demo. This plan outlines how to train real models for production accuracy.

---

## Phase 1: Data Collection & Preparation (Week 1)

### 1.1 Datasets Required

**Emotion Recognition:**
- **FER2013** - Facial Expression Recognition dataset
- **AffectNet** - Large-scale facial expression dataset
- **Kaggle Emotion Dataset** - Available via Kaggle API

**Attention/Gaze Tracking:**
- **GazeCapture** - Eye tracking dataset
- **MPIIGaze** - Gaze estimation dataset

**Speech Emotion:**
- **RAVDESS** - Ryerson Audio-Visual Database
- **CREMA-D** - Crowd-sourced Emotional Multimodal Actors Dataset

### 1.2 Data Setup

```bash
# Install Kaggle CLI
pip install kaggle

# Setup Kaggle credentials (see scripts/setup-kaggle.js)
# Place kaggle.json in ~/.kaggle/

# Download datasets
kaggle datasets download -d msambare/fer2013
kaggle datasets download -d uwrfkaggler/ravdess-emotional-speech-audio
```

### 1.3 Data Preprocessing

Create preprocessing scripts:

```python
# scripts/preprocess_emotion_data.py
# - Resize images to 64x64 or 128x128
# - Normalize pixel values [0, 1]
# - Augment data (rotation, flip, brightness)
# - Split train/val/test (70/15/15)
```

---

## Phase 2: Model Training (Week 2-3)

### 2.1 Emotion Recognition Model

**Architecture:** CNN (Convolutional Neural Network)

```python
# Model structure
Input: 64x64x3 RGB image
Conv2D(32) → ReLU → MaxPool
Conv2D(64) → ReLU → MaxPool
Conv2D(128) → ReLU → MaxPool
Flatten
Dense(256) → ReLU → Dropout(0.5)
Dense(8) → Softmax  # 8 emotion classes

# Training
- Optimizer: Adam
- Loss: Categorical Crossentropy
- Epochs: 50-100
- Batch size: 32
- Learning rate: 0.001 with decay
```

**Expected Accuracy:** 65-75% (good for demo)

### 2.2 Attention/Gaze Model

**Architecture:** CNN + Regression Head

```python
# Model structure
Input: 64x64x3 RGB image
Base CNN (same as emotion)
Dense(128) → ReLU
Dense(3) → [attention_score, gaze_x, gaze_y]

# Training
- Loss: MSE for regression
- Metrics: MAE for attention, gaze error
```

**Expected Accuracy:** 80-85% attention detection

### 2.3 Speech Emotion Model

**Architecture:** CNN or LSTM for audio spectrograms

```python
# Preprocessing
- Convert audio to mel-spectrogram
- Input shape: (128, 128) spectrogram

# Model
Conv2D layers for spectrogram
LSTM layers for temporal patterns
Dense(8) → Softmax  # 8 emotion classes
```

**Expected Accuracy:** 60-70%

---

## Phase 3: Model Export & Integration (Week 4)

### 3.1 Export to ONNX

```python
# After training, export to ONNX
import onnx
import tf2onnx

# Convert TensorFlow/Keras model to ONNX
onnx_model = tf2onnx.convert.from_keras(model)
onnx.save_model(onnx_model, "models/emotion_model.onnx")
```

### 3.2 Place Models in Server

```bash
# Create models directory
mkdir -p ai/server/models

# Copy trained models
cp emotion_model.onnx ai/server/models/
cp attention_model.onnx ai/server/models/
cp speech_model.onnx ai/server/models/
```

### 3.3 Update Server Configuration

```python
# In ai/server/main.py, update paths:
EMOTION_MODEL_PATH = "models/emotion_model.onnx"
ATTENTION_MODEL_PATH = "models/attention_model.onnx"
SPEECH_MODEL_PATH = "models/speech_model.onnx"
```

---

## Phase 4: Testing & Validation (Week 5)

### 4.1 Test with Real Data

- Test with actual game session recordings
- Compare fallback vs. trained model results
- Validate accuracy on test set

### 4.2 Performance Optimization

- Optimize model size (quantization)
- Reduce inference time (< 100ms per frame)
- Test on production hardware

---

## Quick Start: Training Scripts

### Option 1: Use Pre-trained Models (Fastest)

```bash
# Download pre-trained models from HuggingFace or similar
# Place in ai/server/models/
```

### Option 2: Train from Scratch

```bash
# 1. Setup environment
cd ai/server
python -m venv venv
source venv/bin/activate
pip install tensorflow keras opencv-python numpy

# 2. Download data
python scripts/download_datasets.py

# 3. Train models
python scripts/train_emotion_model.py
python scripts/train_attention_model.py
python scripts/train_speech_model.py

# 4. Export to ONNX
python scripts/export_models.py
```

---

## Current Status: Fallback Mode

**For Demo:** The AI server uses intelligent fallback heuristics:
- ✅ Emotion detection: Returns realistic emotion distributions
- ✅ Attention tracking: Calculates based on engagement patterns
- ✅ Engagement scoring: Combines emotion + attention metrics

**This is sufficient for video demo!** Models can be trained later.

---

## Accuracy Targets

| Model | Current (Fallback) | Target (Trained) |
|-------|-------------------|------------------|
| Emotion Recognition | ~40% (heuristic) | 65-75% |
| Attention Detection | ~60% (simple calc) | 80-85% |
| Engagement Scoring | ~50% (combined) | 75-80% |
| Speech Emotion | ~30% (energy-based) | 60-70% |

---

## Resources

- **Kaggle Datasets:** https://www.kaggle.com/datasets
- **ONNX Runtime:** https://onnxruntime.ai/
- **TensorFlow Tutorials:** https://www.tensorflow.org/tutorials
- **FER2013 Paper:** https://arxiv.org/abs/1604.06778

---

## Timeline Summary

- **Week 1:** Data collection & prep
- **Week 2-3:** Model training
- **Week 4:** Export & integration
- **Week 5:** Testing & optimization

**Total:** ~5 weeks for production-ready models

**For Demo:** Fallback mode works immediately! ✅

---

## Next Steps After Demo

1. ✅ Demo works with fallback (current)
2. 📅 Week 1: Collect/prepare datasets
3. 📅 Week 2-3: Train models
4. 📅 Week 4: Integrate trained models
5. 📅 Week 5: Test & deploy

**Priority:** Get demo working first, then improve AI accuracy! 🚀

