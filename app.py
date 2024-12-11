from flask import Flask, request, Response, render_template
from openai import OpenAI
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

# API Configurations
API_ENDPOINT_1 = 'http://xxxx/v1'
API_KEY_1 = 'xxxx'
#用于好一点的大模型


API_ENDPOINT_2 = 'http://xxxx/v1'
API_KEY_2 = '-xxx'
#用于低成本的大模型拆书、ai自我迭代的

# Initialize OpenAI clients
client1 = OpenAI(
    base_url=API_ENDPOINT_1,
    api_key=API_KEY_1
)

client2 = OpenAI(
    base_url=API_ENDPOINT_2,
    api_key=API_KEY_2
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gen', methods=['POST'])
#/gen接口这个可以是效果比较好的模型接口，用于大纲、章节、正文的生成

def generate():
    data = request.json
    prompt = data.get('prompt', '')
    app.logger.debug(f"Received prompt for gen: {prompt}")
    
    def generate_stream():
        try:
            completion = client1.chat.completions.create(
                model="Qwen2.5-72B-Instruct",
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
#/gen2这个可以自己替换低成本模型的接口，用于AI批量自我迭代【探索】和拆书

def generate2():
    data = request.json
    prompt = data.get('prompt', '')
    app.logger.debug(f"Received prompt for gen2: {prompt}")
    
    def generate_stream():
        try:
            completion = client2.chat.completions.create(
                model="Qwen2.5-72B-Instruct",
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
