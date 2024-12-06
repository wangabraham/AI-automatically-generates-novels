from flask import Flask, request, Response, render_template
import dashscope
import json
import logging
from http import HTTPStatus
from dashscope import Generation

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

# 配置DashScope API密钥
DASHSCOPE_API_KEY = "your-api-key-here"
dashscope.api_key = DASHSCOPE_API_KEY

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
            # 创建Qianwen API请求
            responses = Generation.call(
                model='qwen-max',  # 或其他可用模型
                prompt=prompt,
                result_format='message',  # 使用消息格式
                stream=True,
                top_p=0.8,
                temperature=0.7,
                max_tokens=1500,
                stop=None,
                api_key=DASHSCOPE_API_KEY
            )
            
            # 处理流式响应
            for response in responses:
                if response.status_code == HTTPStatus.OK:
                    # 转换响应格式以匹配原有格式
                    if response.output and response.output.text:
                        response_chunk = {
                            'response': response.output.text
                        }
                        app.logger.debug(f"Yielding response: {response.output.text}")
                        yield json.dumps(response_chunk) + '\n'
                else:
                    error_msg = f"Error: {response.code} - {response.message}"
                    app.logger.error(error_msg)
                    yield json.dumps({'response': error_msg}) + '\n'
                    
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            app.logger.error(f"Error in generate_stream: {e}")
            yield json.dumps({'response': error_msg}) + '\n'

    return Response(generate_stream(), mimetype='application/json-stream')

if __name__ == '__main__':
    app.run(debug=True, port=20000, host="0.0.0.0")
