# pip3 install flask requests sseclient-py
from flask import Flask, request, Response, render_template
import requests
import json
import logging
import sseclient

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

# API Configurations
API_ENDPOINT_1 = 'http://XXXX'
API_KEY_1 = 'xxxx'
API_ENDPOINT_2 = API_ENDPOINT_1
API_KEY_2 = API_KEY_1

def create_headers(api_key):
    return {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gen', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt', '')
    app.logger.debug(f"Received prompt for gen: {prompt}")
    
    def generate_stream():
        try:
            # 最新的 Deepseek API payload 结构
            payload = {
                "model": "deepseek-chat",  # 或使用其他可用模型如 deepseek-coder
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "stream": True,
                "temperature": 0.7,
                "top_p": 0.95,
                "max_tokens": 2048,
                "presence_penalty": 0,
                "frequency_penalty": 0,
                "stop": None
            }
            
            response = requests.post(
                f"{API_ENDPOINT_1}/v1/chat/completions",
                headers=create_headers(API_KEY_1),
                json=payload,
                stream=True
            )
            
            app.logger.debug("Stream created successfully for gen")
            
            client = sseclient.SSEClient(response)
            
            for event in client.events():
                if event.data != "[DONE]":
                    try:
                        chunk_data = json.loads(event.data)
                        # 处理最新的响应格式
                        if 'choices' in chunk_data and chunk_data['choices']:
                            if 'delta' in chunk_data['choices'][0]:
                                content = chunk_data['choices'][0]['delta'].get('content', '')
                                if content:
                                    app.logger.debug(f"Yielding chunk: {content}")
                                    yield content
                    except json.JSONDecodeError as e:
                        app.logger.error(f"JSON decode error: {e}")
                        continue
                        
        except Exception as e:
            app.logger.error(f"Error in generate_stream: {e}")
            yield f"Error: {str(e)}"
    
    return Response(generate_stream(), mimetype='text/plain')

@app.route('/gen2', methods=['POST'])
def generate2():
    data = request.json
    prompt = data.get('prompt', '')
    app.logger.debug(f"Received prompt for gen2: {prompt}")
    
    def generate_stream():
        try:
            # 可以为 gen2 配置不同的参数
            payload = {
                "model": "deepseek-chat",  # 可以使用不同的模型
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "stream": True,
                "temperature": 0.8,  # 可以调整参数
                "top_p": 0.95,
                "max_tokens": 4096,  # 可以根据需要调整
                "presence_penalty": 0,
                "frequency_penalty": 0,
                "stop": None
            }
            
            response = requests.post(
                f"{API_ENDPOINT_2}/v1/chat/completions",
                headers=create_headers(API_KEY_2),
                json=payload,
                stream=True
            )
            
            app.logger.debug("Stream created successfully for gen2")
            
            client = sseclient.SSEClient(response)
            
            for event in client.events():
                if event.data != "[DONE]":
                    try:
                        chunk_data = json.loads(event.data)
                        if 'choices' in chunk_data and chunk_data['choices']:
                            if 'delta' in chunk_data['choices'][0]:
                                content = chunk_data['choices'][0]['delta'].get('content', '')
                                if content:
                                    app.logger.debug(f"Yielding chunk: {content}")
                                    yield content
                    except json.JSONDecodeError as e:
                        app.logger.error(f"JSON decode error: {e}")
                        continue
                        
        except Exception as e:
            app.logger.error(f"Error in generate_stream: {e}")
            yield f"Error: {str(e)}"
    
    return Response(generate_stream(), mimetype='text/plain')

if __name__ == '__main__':
    app.run(debug=True, port=60000, host="0.0.0.0")
