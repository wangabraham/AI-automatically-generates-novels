from flask import Flask, request, Response, render_template
import requests
import json
import logging
import time

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

# DoBe API configuration
DOBE_API_URL = "https://www.doubao.com/api/chat/completions"  # 请替换为实际的豆包API地址
API_KEY = "YOUR_API_KEY"  # 请替换为您的豆包API密钥

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gen', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt', '')
    app.logger.debug(f"Received prompt: {prompt}")
    
    def generate_stream():
        try:
            headers = {
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "doubao-001",  # 请替换为实际的模型名称
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "stream": True,
                "temperature": 0.7,
                "top_p": 0.95,
                "max_tokens": 1024
            }
            
            response = requests.post(
                DOBE_API_URL,
                headers=headers,
                json=payload,
                stream=True
            )
            app.logger.debug(f"DoBe API response status: {response.status_code}")
            
            for line in response.iter_lines():
                if line:
                    try:
                        # 移除 "data: " 前缀（如果存在）
                        line_str = line.decode('utf-8')
                        if line_str.startswith("data: "):
                            line_str = line_str[6:]
                        
                        # 跳过心跳消息
                        if line_str == "[DONE]":
                            continue
                            
                        json_response = json.loads(line_str)
                        
                        # 提取响应文本并转换为与原格式兼容的格式
                        if 'choices' in json_response and len(json_response['choices']) > 0:
                            content = json_response['choices'][0].get('delta', {}).get('content', '')
                            if content:
                                # 转换为与原来格式兼容的响应
                                compatible_response = {
                                    'response': content
                                }
                                app.logger.debug(f"Yielding response: {content}")
                                yield json.dumps(compatible_response) + '\n'
                                
                    except json.JSONDecodeError as e:
                        app.logger.error(f"JSON decode error: {e}, Line: {line}")
                        
        except Exception as e:
            app.logger.error(f"Error in generate_stream: {e}")
            error_response = {
                'response': f"Error: {str(e)}"
            }
            yield json.dumps(error_response) + '\n'

    return Response(generate_stream(), mimetype='application/json')

if __name__ == '__main__':
    app.run(debug=True, port=20000, host="0.0.0.0")
