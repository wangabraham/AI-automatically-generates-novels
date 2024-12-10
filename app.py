from flask import Flask, request, Response, render_template
import requests
import json
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

OLLAMA_API_URL = "http://127.0.0.1:10086/api/generate"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gen', methods=['POST'])
#这个可以是效果比较好的模型接口，用于大纲、章节、正文的生成
def generate():
    data = request.json
    prompt = data.get('prompt', '')
    app.logger.debug(f"Received prompt: {prompt}")

    def generate_stream():
        try:
            response = requests.post(
                OLLAMA_API_URL,
                json={
                    "model": "gemma2:27b",
                    "prompt": prompt,
                    "stream": True
                },
                stream=True
            )
            app.logger.debug(f"Ollama API response status: {response.status_code}")

            for line in response.iter_lines():
                if line:
                    try:
                        json_response = json.loads(line)
                        if 'response' in json_response:
                            app.logger.debug(f"Yielding response: {json_response['response']}")
                            yield json_response['response']
                    except json.JSONDecodeError as e:
                        app.logger.error(f"JSON decode error: {e}, Line: {line}")
        except Exception as e:
            app.logger.error(f"Error in generate_stream: {e}")
            yield f"Error: {str(e)}"

    return Response(generate_stream(), mimetype='text/plain')

@app.route('/gen2', methods=['POST'])
#这个可以自己替换低成本的接口，用于AI批量自我迭代和拆书
def generate():
    data = request.json
    prompt = data.get('prompt', '')
    app.logger.debug(f"Received prompt: {prompt}")

    def generate_stream():
        try:
            response = requests.post(
                OLLAMA_API_URL,
                json={
                    "model": "gemma2:27b",
                    "prompt": prompt,
                    "stream": True
                },
                stream=True
            )
            app.logger.debug(f"Ollama API response status: {response.status_code}")

            for line in response.iter_lines():
                if line:
                    try:
                        json_response = json.loads(line)
                        if 'response' in json_response:
                            app.logger.debug(f"Yielding response: {json_response['response']}")
                            yield json_response['response']
                    except json.JSONDecodeError as e:
                        app.logger.error(f"JSON decode error: {e}, Line: {line}")
        except Exception as e:
            app.logger.error(f"Error in generate_stream: {e}")
            yield f"Error: {str(e)}"

    return Response(generate_stream(), mimetype='text/plain')


if __name__ == '__main__':
    app.run(debug=True, port=20000, host="0.0.0.0")
