from flask import Flask, request, Response, render_template
import requests
import json
import logging
import time

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

# 文心一言 API 配置
WENXIN_API_URL = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro"
API_KEY = "YOUR_API_KEY"
SECRET_KEY = "YOUR_SECRET_KEY"

def get_access_token():
    """
    获取百度API access token
    """
    url = f"https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id={API_KEY}&client_secret={SECRET_KEY}"
    response = requests.get(url)
    return response.json().get("access_token")

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
            access_token = get_access_token()
            
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            payload = {
                "messages": [{"role": "user", "content": prompt}],
                "stream": True
            }
            
            response = requests.post(
                f"{WENXIN_API_URL}?access_token={access_token}",
                headers=headers,
                json=payload,
                stream=True
            )
            
            app.logger.debug(f"Wenxin API response status: {response.status_code}")
            
            for line in response.iter_lines():
                if line:
                    try:
                        # 文心一言的返回格式是 "data: {JSON}" 格式
                        if line.startswith(b'data: '):
                            json_str = line[6:].decode('utf-8')
                            if json_str.strip() == '[DONE]':
                                break
                            
                            json_response = json.loads(json_str)
                            # 转换为与原格式兼容的结构
                            if 'result' in json_response:
                                compatible_response = {
                                    'response': json_response['result']
                                }
                                app.logger.debug(f"Yielding response: {compatible_response['response']}")
                                yield compatible_response['response']
                                
                    except json.JSONDecodeError as e:
                        app.logger.error(f"JSON decode error: {e}, Line: {line}")
                        
        except Exception as e:
            app.logger.error(f"Error in generate_stream: {e}")
            yield f"Error: {str(e)}"

    return Response(generate_stream(), mimetype='text/plain')

if __name__ == '__main__':
    app.run(debug=True, port=20000, host="0.0.0.0")
