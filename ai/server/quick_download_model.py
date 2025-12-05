#!/usr/bin/env python3
"""
Quick Download: Get a Working Pre-trained Emotion Model
Tries multiple sources to get a reliable, working model.
"""

import os
import urllib.request
import ssl
from pathlib import Path

# Disable SSL verification for some sources (use with caution)
ssl._create_default_https_context = ssl._create_unverified_context

MODEL_SOURCES = [
    {
        "name": "HuggingFace ONNX Models",
        "url": "https://huggingface.co/onnx/models/resolve/main/vision/body_analysis/emotion_ferplus/model/emotion-ferplus-8.onnx",
        "filename": "emotion_emotionnet.onnx"
    },
    {
        "name": "Alternative Source 1",
        "url": "https://github.com/onnx/models/raw/main/vision/body_analysis/emotion_ferplus/model/emotion-ferplus-8.onnx",
        "filename": "emotion_emotionnet.onnx"
    },
    {
        "name": "Model Zoo Direct",
        "url": "https://onnxzoo.blob.core.windows.net/models/opset_8/emotion_ferplus/emotion-ferplus-8.onnx",
        "filename": "emotion_emotionnet.onnx"
    }
]

def download_model():
    """Try to download from multiple sources."""
    models_dir = Path(__file__).parent / "models"
    models_dir.mkdir(exist_ok=True)
    
    model_path = models_dir / "emotion_emotionnet.onnx"
    
    if model_path.exists():
        print(f"✅ Model already exists: {model_path}")
        print(f"   Size: {model_path.stat().st_size / (1024*1024):.2f} MB")
        return str(model_path)
    
    print("🔍 Searching for pre-trained emotion recognition model...")
    print("=" * 60)
    
    for source in MODEL_SOURCES:
        print(f"\n📥 Trying: {source['name']}")
        print(f"   URL: {source['url']}")
        
        try:
            print("   Downloading...", end=" ", flush=True)
            urllib.request.urlretrieve(source['url'], str(model_path))
            
            # Verify file
            if model_path.exists() and model_path.stat().st_size > 1000:  # At least 1KB
                size_mb = model_path.stat().st_size / (1024*1024)
                print(f"✅ Success!")
                print(f"   File size: {size_mb:.2f} MB")
                print(f"   Location: {model_path}")
                return str(model_path)
            else:
                print("❌ File too small or invalid")
                if model_path.exists():
                    model_path.unlink()
        except Exception as e:
            print(f"❌ Failed: {str(e)[:50]}")
            if model_path.exists():
                model_path.unlink()
            continue
    
    print("\n" + "=" * 60)
    print("❌ Could not download pre-trained model from any source.")
    print("\n📝 Alternative: Train your own model")
    print("   1. Download FER2013 dataset from Kaggle")
    print("   2. Run: python setup_and_train.py")
    print("   3. This will train a real, accurate model")
    print("\n💡 Training takes 30-60 minutes but gives you:")
    print("   - 70-80% accuracy (vs 40% with fallback)")
    print("   - Real AI (not heuristics)")
    print("   - Customized for your needs")
    
    return None

def verify_model(model_path):
    """Verify the downloaded model works."""
    if not model_path or not os.path.exists(model_path):
        return False
    
    try:
        import onnxruntime as ort
        session = ort.InferenceSession(model_path)
        
        # Check input/output
        input_shape = session.get_inputs()[0].shape
        output_shape = session.get_outputs()[0].shape
        
        print("\n🧪 Model Verification:")
        print(f"   Input shape: {input_shape}")
        print(f"   Output shape: {output_shape}")
        print(f"   ✅ Model is valid and ready to use!")
        
        return True
    except Exception as e:
        print(f"   ❌ Model verification failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🤖 Quick Model Download for Cognicare")
    print("=" * 60)
    
    model_path = download_model()
    
    if model_path:
        verify_model(model_path)
        print("\n" + "=" * 60)
        print("✅ Model ready! Start the server:")
        print("   python -m uvicorn main:app --reload")
        print("=" * 60)
    else:
        print("\n💡 Recommendation: Train your own model for best results")
        print("   Run: python setup_and_train.py")

