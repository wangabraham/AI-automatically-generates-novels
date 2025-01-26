from flask import Flask, request, Response, render_template
from openai import OpenAI
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

# DeepSeek API 配置
DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.com/v1'  # DeepSeek 的 API 地址
DEEPSEEK_API_KEY = '你的API密钥'  # 替换为你的 DeepSeek API 密钥

# 初始化 DeepSeek 客户端
deepseek_client = OpenAI(
    base_url=DEEPSEEK_API_ENDPOINT,
    api_key=DEEPSEEK_API_KEY
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gen', methods=['POST'])
def generate():
    """
    /gen 接口：用于生成小说大纲、章节、正文等内容
    """
    data = request.json
    prompt = data.get('prompt', '')
    app.logger.debug(f"Received prompt for gen: {prompt}")
    
    def generate_stream():
        try:
            # 调用 DeepSeek 的 R1 模型
            completion = deepseek_client.chat.completions.create(
                model="deepseek-r1",  # 使用 DeepSeek 的 R1 模型
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )
            
            app.logger.debug("Stream created successfully for gen")
            
            for chunk in completion:
                if chunk.choices[0].delta.content is not None:
                    app.logger.debug(f"Yielding chunk: {chunk.choices[0].delta.content}")
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            app.logger.error(f"Error in generate_stream: {e}")
            yield f"Error: {str(e)}"
    
    return Response(generate_stream(), mimetype='text/plain')

@app.route('/gen2', methods=['POST'])
def generate2():
    """
    /gen2 接口：用于低成本模型的批量生成或拆书
    """
    data = request.json
    prompt = data.get('prompt', '')
    app.logger.debug(f"Received prompt for gen2: {prompt}")
    
    def generate_stream():
        try:
            # 调用 DeepSeek 的 R1 模型（或其他低成本模型）
            completion = deepseek_client.chat.completions.create(
                model="deepseek-r1",  # 使用 DeepSeek 的 R1 模型
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )
            
            app.logger.debug("Stream created successfully for gen2")
            
            for chunk in completion:
                if chunk.choices[0].delta.content is not None:
                    app.logger.debug(f"Yielding chunk: {chunk.choices[0].delta.content}")
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            app.logger.error(f"Error in generate_stream: {e}")
            yield f"Error: {str(e)}"
    
    return Response(generate_stream(), mimetype='text/plain')

if __name__ == '__main__':
    app.run(debug=True, port=60000, host="0.0.0.0")
