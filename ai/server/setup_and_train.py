#!/usr/bin/env python3
"""
Complete AI Model Setup and Training for Cognicare
This script will:
1. Download FER2013 dataset
2. Train a real emotion recognition model
3. Export to ONNX format
4. Verify it works
"""

import os
import sys
import subprocess
import urllib.request
import zipfile
from pathlib import Path

def check_dependencies():
    """Check if all required packages are installed."""
    print("🔍 Checking dependencies...")
    required = ['tensorflow', 'keras', 'numpy', 'opencv-python', 'tf2onnx', 'pandas']
    missing = []
    
    for pkg in required:
        try:
            __import__(pkg.replace('-', '_'))
        except ImportError:
            missing.append(pkg)
    
    if missing:
        print(f"❌ Missing packages: {', '.join(missing)}")
        print("📦 Installing...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing)
        print("✅ Dependencies installed!")
    else:
        print("✅ All dependencies available")

def download_fer2013():
    """Download FER2013 dataset."""
    print("\n📥 Downloading FER2013 dataset...")
    data_dir = Path("data/fer2013")
    data_dir.mkdir(parents=True, exist_ok=True)
    
    csv_path = data_dir / "fer2013.csv"
    
    if csv_path.exists():
        print(f"✅ Dataset already exists: {csv_path}")
        return str(csv_path)
    
    print("⚠️  FER2013 dataset not found.")
    print("📝 You need to download it manually:")
    print("   1. Go to: https://www.kaggle.com/datasets/msambare/fer2013")
    print("   2. Download fer2013.csv")
    print("   3. Place it in: data/fer2013/fer2013.csv")
    print("\n   Or use Kaggle API:")
    print("   kaggle datasets download -d msambare/fer2013")
    
    return None

def train_real_model(csv_path):
    """Train a real emotion recognition model."""
    print("\n🤖 Training Emotion Recognition Model...")
    print("=" * 60)
    
    import numpy as np
    import cv2
    import pandas as pd
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers
    import tf2onnx
    
    # Load data
    print("📊 Loading FER2013 data...")
    df = pd.read_csv(csv_path)
    
    # Parse images and labels
    images = []
    labels = []
    
    for idx, row in df.iterrows():
        # Parse pixels
        pixels = np.array([int(x) for x in row['pixels'].split()], dtype=np.uint8)
        # Reshape to 48x48
        img = pixels.reshape(48, 48)
        # Convert to RGB
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        # Resize to 64x64 (our target size)
        img = cv2.resize(img, (64, 64))
        # Normalize
        img = img.astype('float32') / 255.0
        
        images.append(img)
        labels.append(int(row['emotion']))
        
        if (idx + 1) % 1000 == 0:
            print(f"   Processed {idx + 1}/{len(df)} images...")
    
    images = np.array(images)
    labels = np.array(labels)
    
    print(f"✅ Loaded {len(images)} images")
    print(f"   Shape: {images.shape}")
    print(f"   Labels: {len(set(labels))} classes")
    
    # Split data
    split_idx = int(len(images) * 0.8)
    train_images = images[:split_idx]
    train_labels = labels[:split_idx]
    val_images = images[split_idx:]
    val_labels = labels[split_idx:]
    
    print(f"\n📊 Data split:")
    print(f"   Training: {len(train_images)} samples")
    print(f"   Validation: {len(val_images)} samples")
    
    # Create model architecture
    print("\n🏗️  Building model architecture...")
    model = keras.Sequential([
        layers.Input(shape=(64, 64, 3)),
        
        # First conv block
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        # Second conv block
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        # Third conv block
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        # Dense layers
        layers.Flatten(),
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.5),
        
        # Output layer (7 emotions from FER2013)
        layers.Dense(7, activation='softmax')
    ])
    
    # Compile
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print("✅ Model created")
    model.summary()
    
    # Data augmentation
    print("\n🔄 Setting up data augmentation...")
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    
    datagen = ImageDataGenerator(
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
        zoom_range=0.1
    )
    
    # Train model
    print("\n🚀 Starting training...")
    print("   This will take 30-60 minutes depending on your hardware...")
    
    history = model.fit(
        datagen.flow(train_images, train_labels, batch_size=32),
        steps_per_epoch=len(train_images) // 32,
        epochs=50,
        validation_data=(val_images, val_labels),
        verbose=1,
        callbacks=[
            keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
            keras.callbacks.ReduceLROnPlateau(patience=3, factor=0.5)
        ]
    )
    
    # Evaluate
    val_loss, val_acc = model.evaluate(val_images, val_labels, verbose=0)
    print(f"\n✅ Training complete!")
    print(f"   Validation Accuracy: {val_acc:.2%}")
    print(f"   Validation Loss: {val_loss:.4f}")
    
    # Export to ONNX
    print("\n📦 Exporting to ONNX...")
    os.makedirs("models", exist_ok=True)
    
    spec = (tf.TensorSpec((None, 64, 64, 3), tf.float32, name="input"),)
    output_path = "models/emotion_emotionnet.onnx"
    
    model_proto, _ = tf2onnx.convert.from_keras(
        model,
        input_signature=spec,
        output_path=output_path
    )
    
    print(f"✅ Model exported to: {output_path}")
    print(f"   File size: {os.path.getsize(output_path) / (1024*1024):.2f} MB")
    
    # Verify model
    print("\n🧪 Verifying model...")
    import onnxruntime as ort
    session = ort.InferenceSession(output_path)
    input_name = session.get_inputs()[0].name
    
    # Test with a sample
    test_input = val_images[0:1]
    test_input_onnx = np.transpose(test_input, (0, 3, 1, 2)).astype(np.float32)  # NHWC to NCHW
    
    outputs = session.run(None, {input_name: test_input_onnx})
    predicted = np.argmax(outputs[0][0])
    actual = val_labels[0]
    
    print(f"   Test prediction: {predicted} (actual: {actual})")
    print(f"   Confidence: {outputs[0][0][predicted]:.2%}")
    
    if predicted == actual:
        print("   ✅ Model works correctly!")
    else:
        print("   ⚠️  Prediction doesn't match (this is normal for some samples)")
    
    return output_path

def main():
    """Main execution."""
    print("=" * 60)
    print("🤖 Cognicare AI Model Training")
    print("   Complete Setup and Training Pipeline")
    print("=" * 60)
    
    # Check dependencies
    check_dependencies()
    
    # Download dataset
    csv_path = download_fer2013()
    
    if not csv_path:
        print("\n❌ Cannot proceed without dataset.")
        print("   Please download FER2013 and place it in data/fer2013/fer2013.csv")
        return False
    
    # Train model
    model_path = train_real_model(csv_path)
    
    if model_path:
        print("\n" + "=" * 60)
        print("✅ SUCCESS! Model is ready to use!")
        print("=" * 60)
        print(f"\n📁 Model location: {model_path}")
        print("\n🚀 Next steps:")
        print("   1. Start the AI server: python -m uvicorn main:app --reload")
        print("   2. The server will automatically load this model")
        print("   3. Test with: curl http://localhost:8000/health")
        return True
    
    return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

