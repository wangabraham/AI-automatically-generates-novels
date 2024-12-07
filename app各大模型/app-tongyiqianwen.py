from flask import Flask, request, Response, render_template
import requests
import json
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

# 通义千问API URL
TONGYI_QIANWEN_API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"

# 配置API密钥
API_KEY = ""  # 请替换为您的API密钥

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gen', methods=['POST'])
def generate_stream():
    data = request.json
    prompt = data.get('prompt', '')
    app.logger.debug(f"Received prompt: {prompt}")

    def generate_stream_inner(prompt):
        try:
            # 创建Qianwen API请求
            headers = {
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            }
            response = requests.post(
                TONGYI_QIANWEN_API_URL,
                headers=headers,
                json={
                    "model": "qwen-max",  # 使用qwen-max模型
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": True
                },
                stream=True
            )
            
            # 处理流式响应
            for line in response.iter_lines(decode_unicode=True):
                if line:
                    line = line.strip()  # 去除可能的空白字符
                    if line.startswith('data: '):
                        line = line[6:]  # 移除'data: '前缀
                        try:
                            json_response = json.loads(line)
                            if 'choices' in json_response and 'delta' in json_response['choices'][0]:
                                response_text = json_response['choices'][0]['delta']['content']
                                # 逐个字符输出，并在适当的位置添加换行符
                                for char in response_text:
                                    if char == '\n':
                                        yield ' '  # 将换行符替换为空格，避免前端显示问题
                                    else:
                                        yield char
                        except json.JSONDecodeError as e:
                            app.logger.error(f"JSON decode error: {e}, Line: {line}")
        except Exception as e:
            app.logger.error(f"Error in generate_stream: {e}")
            yield str(e)  # 直接yield错误信息

    return Response(generate_stream_inner(prompt), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(debug=True, port=20000, host="0.0.0.0")