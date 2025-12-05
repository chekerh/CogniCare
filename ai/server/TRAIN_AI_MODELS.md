# 🤖 Train AI Models for Cognicare
## Quick Guide to Get Real AI Models Working

**Current Status:** AI is using fallback heuristics (works for demo, but not real AI)

**Goal:** Get trained models working for accurate emotion/attention detection

---

## Option 1: Download Pre-trained Models (FASTEST - 5 minutes) ⭐

### Step 1: Download Emotion Model

```bash
cd ai/server
python download_models.py
```

This downloads a pre-trained FER+ emotion recognition model from ONNX Model Zoo.

### Step 2: Verify

```bash
# Check model exists
ls -lh models/emotion_emotionnet.onnx

# Start server - it will automatically use the model
python -m uvicorn main:app --reload --port 8000
```

**Expected output:**
```
[AI] Loading ONNX model from models/emotion_emotionnet.onnx ...
[AI] Loaded model: models/emotion_emotionnet.onnx
```

✅ **Done!** Emotion recognition now uses real AI instead of fallback.

---

## Option 2: Train Models from Scratch (MORE ACCURATE - 2-3 hours)

### Prerequisites

```bash
# Install training dependencies
pip install tensorflow keras opencv-python numpy tf2onnx
```

### Step 1: Download FER2013 Dataset

1. Go to: https://www.kaggle.com/datasets/msambare/fer2013
2. Download `fer2013.csv`
3. Place it in: `ai/server/data/fer2013/fer2013.csv`

### Step 2: Train Emotion Model

```bash
cd ai/server
python train_emotion_model.py
```

**Training time:** ~30-60 minutes (depending on hardware)

**Expected output:**
```
Training samples: 28,709
Validation samples: 3,589
Validation Accuracy: 65-75%
✅ Model exported to: models/emotion_model.onnx
```

### Step 3: Test the Model

```bash
# Start server
python -m uvicorn main:app --reload --port 8000

# Test with a frame
curl -X POST "http://localhost:8000/vision/frame" \
  -F "frame=@test_image.jpg"
```

---

## Option 3: Use HuggingFace Models (ALTERNATIVE)

### Download from HuggingFace

```bash
# Install huggingface_hub
pip install huggingface_hub

# Download model
python -c "
from huggingface_hub import hf_hub_download
import shutil

# Download emotion model
model_path = hf_hub_download(
    repo_id='onnx/models',
    filename='vision/body_analysis/emotion_ferplus/model/emotion-ferplus-8.onnx',
    local_dir='models'
)
print(f'Downloaded to: {model_path}')
"
```

---

## Model Status Check

### Check if Models Exist

```bash
cd ai/server
ls -lh models/*.onnx
```

### Check Server Logs

When you start the server, look for:
- ✅ `[AI] Loaded model: ...` = Model is working
- ⚠️ `[AI] Model not found at ...` = Using fallback mode

---

## Model Files Expected

| Model | File | Status |
|-------|------|--------|
| Emotion | `models/emotion_emotionnet.onnx` | ⬜ Not trained |
| Attention | `models/attention_gaze.onnx` | ⬜ Not trained (uses fallback) |
| Speech | `models/speech_ravdess.onnx` | ⬜ Not trained (uses fallback) |

---

## Quick Start (Recommended)

**For fastest results:**

```bash
cd ai/server

# Download pre-trained emotion model
python download_models.py

# Start server
python -m uvicorn main:app --reload --port 8000
```

**That's it!** Emotion recognition now uses real AI. 🎉

---

## Accuracy Comparison

| Mode | Emotion Accuracy | Notes |
|------|-----------------|-------|
| Fallback (current) | ~40% | Heuristic-based |
| Pre-trained Model | 65-75% | Ready to use |
| Trained from Scratch | 70-80% | Best accuracy |

---

## Troubleshooting

### "Model not found"
- Check file exists: `ls models/emotion_emotionnet.onnx`
- Check path in `main.py` matches file location

### "Failed to load model"
- Check ONNX file is valid: `onnx.checker.check_model('models/emotion_emotionnet.onnx')`
- Try downloading again

### "FER2013 dataset not found"
- Download from Kaggle
- Place in `ai/server/data/fer2013/fer2013.csv`

---

## Next Steps

1. ✅ Download pre-trained emotion model (5 min)
2. 📅 Train attention model (optional, 1-2 hours)
3. 📅 Train speech model (optional, 1-2 hours)

**Priority:** Get emotion model working first! 🚀

---

## Resources

- **ONNX Model Zoo:** https://github.com/onnx/models
- **FER2013 Dataset:** https://www.kaggle.com/datasets/msambare/fer2013
- **TensorFlow Docs:** https://www.tensorflow.org/tutorials
- **ONNX Runtime:** https://onnxruntime.ai/

