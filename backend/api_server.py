from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from smart_assistant import get_chatbot_response, schduleHandler
from rag_system import embedDoc

app = Flask(__name__)
CORS(app)  # Allow requests from frontend during development

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message')
    history = data.get('history', [])
    if not message:
        return jsonify({'error': 'No message provided'}), 400
    response = get_chatbot_response(message, history)
    return jsonify({'response': response})

@app.route('/api/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    query = request.form.get('query', 'Summarize this document')
    try:
        result = embedDoc(file_path, query)
        print("[api/upload] Result to return:", repr(result))
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    return jsonify({'result': result})

@app.route('/api/schedule', methods=['POST'])
def schedule():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    query = request.form.get('query', '')
    title = request.form.get('title', '')
    try:
        result = schduleHandler.run({
            "schedule": file_path,
            "query": query,
            "title": title
        })
    except Exception as e:
        import traceback
        print("Schedule upload error:", e)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    return jsonify({'result': str(result)})

if __name__ == '__main__':
    app.run(port=5001, debug=True) 