from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import pandas as pd
import openai

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

openai.api_key = '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'

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_document():
    if 'document' not in request.files:
        return "No file part", 400
    file = request.files['document']
    if file.filename == '':
        return "No selected file", 400
    file.save(os.path.join(UPLOAD_FOLDER, file.filename))
    return "File uploaded successfully", 200

@app.route('/files', methods=['GET'])
def list_files():
    files = os.listdir(UPLOAD_FOLDER)
    return jsonify(files)

@app.route('/uploads/<filename>')
def get_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/ask', methods=['POST'])
def ask():
    file = request.files['file']
    question = request.form['question']

    if file and question:
        df = pd.read_excel(file)
        content = df.to_string()

        response = openai.Completion.create(
            engine="davinci-codex",
            prompt=f"{content}\n\nQ: {question}\nA:",
            max_tokens=150
        )

        answer = response.choices[0].text.strip()
        return jsonify({'answer': answer})

    return jsonify({'answer': 'Error in processing request.'})

if __name__ == '__main__':
    app.run(debug=True)
