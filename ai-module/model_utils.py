import cv2
import numpy as np
import base64

try:
    import tensorflow as tf
    from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
    from tensorflow.keras.preprocessing import image
    HAS_TF = True
    
    # Load lightweight model for feature extraction (MobileNetV2 as a stand-in for FaceNet)
    model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')
except ImportError:
    HAS_TF = False
    print("Warning: TensorFlow not found. Using fallback mock embedding.")

def base64_to_image(base64_string):
    """Decode base64 string to an OpenCV image."""
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    img_data = base64.b64decode(base64_string)
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img

def get_face_embedding(img):
    """
    Detect face and extract embedding.
    """
    # 1. Face Detection using OpenCV Haar Cascades
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    if len(faces) == 0:
        return None, "No face detected"
        
    # Take the largest face
    (x, y, w, h) = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)[0]
    face_img = img[y:y+h, x:x+w]
    
    # 2. Extract Embedding
    if HAS_TF:
        face_resized = cv2.resize(face_img, (224, 224))
        x_img = image.img_to_array(face_resized)
        x_img = np.expand_dims(x_img, axis=0)
        x_img = preprocess_input(x_img)
        preds = model.predict(x_img)
        embedding = preds[0].tolist()
        return embedding, "Success"
    else:
        # Fallback: create a deterministic mock embedding based on image histogram
        # This allows the demo to run without TensorFlow while still using the face data
        hist = cv2.calcHist([face_img], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        cv2.normalize(hist, hist)
        embedding = hist.flatten().tolist()
        # Pad or truncate to 128 dims to look like a standard embedding
        if len(embedding) > 128:
            embedding = embedding[:128]
        else:
            embedding = embedding + [0] * (128 - len(embedding))
        return embedding, "Success (Fallback Mock)"

def compute_similarity(emb1, emb2):
    """Compute cosine similarity between two embeddings."""
    vec1 = np.array(emb1)
    vec2 = np.array(emb2)
    
    # Prevent division by zero
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
        
    cos_sim = np.dot(vec1, vec2) / (norm1 * norm2)
    return float(cos_sim)
