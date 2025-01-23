from flask import Flask, request, Response, render_template
import google.generativeai as genai
from dataclasses import dataclass
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

@dataclass
class Delta:
    content: str = None

@dataclass
class Choice:
    delta: Delta

@dataclass
class StreamResponse:
    choices: list[Choice]

# API Configurations
GOOGLE_API_KEY_1 = 'your-api-key-1'
GOOGLE_API_KEY_2 = 'your-api-key-2'

# Initialize Gemini models
genai.configure(api_key=GOOGLE_API_KEY_1)
model1 = genai.GenerativeModel('gemini-pro')
genai.configure(api_key=GOOGLE_API_KEY_2)
model2 = genai.GenerativeModel('gemini-pro')

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
            response = model1.generate_content(
                prompt,
                stream=True
            )
            
            app.logger.debug("Stream created successfully for gen")
            
            for chunk in response:
                if chunk.text:
                    # Format response to match OpenAI structure
                    stream_resp = StreamResponse(
                        choices=[Choice(delta=Delta(content=chunk.text))]
                    )
                    app.logger.debug(f"Yielding chunk: {stream_resp.choices[0].delta.content}")
                    yield stream_resp.choices[0].delta.content
                    
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
            response = model2.generate_content(
                prompt,
                stream=True
            )
            
            app.logger.debug("Stream created successfully for gen2")
            
            for chunk in response:
                if chunk.text:
                    stream_resp = StreamResponse(
                        choices=[Choice(delta=Delta(content=chunk.text))]
                    )
                    app.logger.debug(f"Yielding chunk: {stream_resp.choices[0].delta.content}")
                    yield stream_resp.choices[0].delta.content
                    
        except Exception as e:
            app.logger.error(f"Error in generate_stream: {e}")
            yield f"Error: {str(e)}"
    
    return Response(generate_stream(), mimetype='text/plain')

if __name__ == '__main__':
    app.run(debug=True, port=60000, host="0.0.0.0")
