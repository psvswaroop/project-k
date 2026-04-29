from flask import Flask, request, jsonify
from flask_cors import CORS
import model_utils
import json
import hashlib

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "AI Identity Module is running"}), 200

@app.route('/extract_embedding', methods=['POST'])
def extract_embedding():
    """
    Receives a base64 encoded image, detects the face, and returns its embedding vector.
    """
    try:
        data = request.json
        if 'image' not in data:
            return jsonify({"error": "No image provided"}), 400
            
        base64_img = data['image']
        img = model_utils.base64_to_image(base64_img)
        
        embedding, status = model_utils.get_face_embedding(img)
        
        if embedding is None:
            return jsonify({"error": status}), 400
            
        # Compute SHA-256 hash of the embedding to anchor on blockchain
        # We round slightly so minor floating point differences don't break the hash, 
        # but since we store the encrypted embedding on IPFS, we can hash the exact JSON representation.
        embedding_str = json.dumps(embedding)
        data_hash = hashlib.sha256(embedding_str.encode('utf-8')).hexdigest()
            
        return jsonify({
            "embedding": embedding,
            "hash": data_hash,
            "status": status
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/verify', methods=['POST'])
def verify():
    """
    Receives a base64 encoded live capture image and a stored embedding.
    Returns match score and boolean.
    """
    try:
        data = request.json
        if 'image' not in data or 'stored_embedding' not in data:
            return jsonify({"error": "Missing image or stored_embedding"}), 400
            
        base64_img = data['image']
        stored_embedding = data['stored_embedding']
        
        # 1. Extract embedding from live image
        img = model_utils.base64_to_image(base64_img)
        live_embedding, status = model_utils.get_face_embedding(img)
        
        if live_embedding is None:
            return jsonify({"error": status, "match": False}), 400
            
        # 2. Compare embeddings
        similarity = model_utils.compute_similarity(live_embedding, stored_embedding)
        
        # 3. Decision threshold (e.g., > 0.85 for Match)
        MATCH_THRESHOLD = 0.85
        is_match = similarity >= MATCH_THRESHOLD
        
        return jsonify({
            "match": bool(is_match),
            "score": similarity,
            "status": "Verification completed"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/log_location', methods=['POST'])
def log_location():
    """
    Silently logs user location and system data.
    """
    try:
        data = request.json
        lat = data.get('lat')
        lon = data.get('lon')
        user = data.get('user', 'Unknown')
        
        # In a real app, log this securely to a database.
        print(f"📍 [SECURITY LOG] Location captured for {user}: Lat {lat}, Lon {lon}")
        
        return jsonify({"status": "Location securely logged"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run locally on port 5000
    app.run(host='127.0.0.1', port=5000, debug=True)
