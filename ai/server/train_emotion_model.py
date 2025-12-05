#!/usr/bin/env python3
"""
Train Emotion Recognition Model for Cognicare
Trains a CNN model on FER2013 dataset for facial emotion recognition.
"""

import os
import numpy as np
import cv2
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import onnx
import tf2onnx

# Configuration
IMG_SIZE = 48  # FER2013 uses 48x48 images
NUM_CLASSES = 7  # angry, disgust, fear, happy, sad, surprise, neutral
BATCH_SIZE = 32
EPOCHS = 50
MODEL_PATH = "models/emotion_model.onnx"

def load_fer2013_data(csv_path: str):
    """Load FER2013 dataset from CSV."""
    print("Loading FER2013 data...")
    
    # FER2013 format: emotion,pixels,Usage
    # emotions: 0=Angry, 1=Disgust, 2=Fear, 3=Happy, 4=Sad, 5=Surprise, 6=Neutral
    
    images = []
    labels = []
    
    with open(csv_path, 'r') as f:
        next(f)  # Skip header
        for line in f:
            parts = line.strip().split(',')
            emotion = int(parts[0])
            pixels = np.array([int(x) for x in parts[1].split()], dtype=np.uint8)
            usage = parts[2]
            
            # Reshape to 48x48
            img = pixels.reshape(48, 48)
            # Convert to RGB (grayscale to 3 channels)
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
            # Resize to target size
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            # Normalize
            img = img.astype('float32') / 255.0
            
            images.append(img)
            labels.append(emotion)
    
    return np.array(images), np.array(labels)

def create_model():
    """Create CNN model for emotion recognition."""
    model = keras.Sequential([
        # Input layer
        layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3)),
        
        # Convolutional layers
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        # Flatten and dense layers
        layers.Flatten(),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.5),
        
        # Output layer
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def train_model():
    """Train the emotion recognition model."""
    print("🤖 Training Emotion Recognition Model")
    print("=" * 50)
    
    # Check if FER2013 data exists
    csv_path = "data/fer2013/fer2013.csv"
    if not os.path.exists(csv_path):
        print("❌ FER2013 dataset not found!")
        print("📥 Download it from: https://www.kaggle.com/datasets/msambare/fer2013")
        print("   Place fer2013.csv in: data/fer2013/")
        return False
    
    # Load data
    images, labels = load_fer2013_data(csv_path)
    
    # Split data
    split_idx = int(len(images) * 0.8)
    train_images = images[:split_idx]
    train_labels = labels[:split_idx]
    val_images = images[split_idx:]
    val_labels = labels[split_idx:]
    
    print(f"Training samples: {len(train_images)}")
    print(f"Validation samples: {len(val_images)}")
    
    # Create model
    model = create_model()
    model.summary()
    
    # Train
    print("\n🚀 Starting training...")
    history = model.fit(
        train_images, train_labels,
        batch_size=BATCH_SIZE,
        epochs=EPOCHS,
        validation_data=(val_images, val_labels),
        verbose=1
    )
    
    # Evaluate
    val_loss, val_acc = model.evaluate(val_images, val_labels, verbose=0)
    print(f"\n✅ Training complete!")
    print(f"   Validation Accuracy: {val_acc:.2%}")
    
    # Export to ONNX
    print("\n📦 Exporting to ONNX...")
    os.makedirs("models", exist_ok=True)
    
    # Convert to ONNX
    spec = (tf.TensorSpec((None, IMG_SIZE, IMG_SIZE, 3), tf.float32, name="input"),)
    output_path = MODEL_PATH
    model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=spec, output_path=output_path)
    
    print(f"✅ Model exported to: {output_path}")
    return True

if __name__ == "__main__":
    train_model()

