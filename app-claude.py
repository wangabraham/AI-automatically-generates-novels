from flask import Flask, request, Response, render_template
import anthropic
import json
import logging
import sseclient
import requests

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

# Claude API configuration
CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
API_KEY = "your-api-key-here"  # Should be stored securely, e.g., in environment variables

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gen', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt', '')
    app.logger.debug(f"Received prompt: {prompt}")

    def generate_stream():
        headers = {
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
            "accept": "text/event-stream"
        }

        try:
            response = requests.post(
                CLAUDE_API_URL,
                headers=headers,
                json={
                    "model": "claude-3-sonnet-20240229",
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": True,
                    "max_tokens": 4096
                },
                stream=True
            )
            
            app.logger.debug(f"Claude API response status: {response.status_code}")
            
            client = sseclient.SSEClient(response)
            
            for event in client.events():
                if event.data:
                    try:
                        data = json.loads(event.data)
                        if data.get('type') == 'content_block_delta':
                            # Format response to match your original format
                            response_chunk = {
                                'response': data.get('delta', {}).get('text', '')
                            }
                            app.logger.debug(f"Yielding response: {response_chunk['response']}")
                            yield json.dumps(response_chunk) + '\n'
                    except json.JSONDecodeError as e:
                        app.logger.error(f"JSON decode error: {e}, Data: {event.data}")
                        
        except Exception as e:
            app.logger.error(f"Error in generate_stream: {e}")
            error_response = {
                'response': f"Error: {str(e)}"
            }
            yield json.dumps(error_response) + '\n'

    return Response(generate_stream(), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(debug=True, port=20000, host="0.0.0.0")
