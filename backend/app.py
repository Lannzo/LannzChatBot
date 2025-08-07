from flask import Flask, jsonify, request
from flask_cors import CORS
from openai import OpenAI

# flask server
app = Flask(__name__)
CORS(app) 

# setup ollama client
client = OpenAI(
    base_url= 'http://localhost:11434/v1',
    api_key= 'dummy_key',
)

try:
    with open('my_facts.txt', 'r') as f:
        facts = f.read()
except FileNotFoundError:
    facts = "No facts available."

@app.route('/ask', methods=['POST'])
def ask_ai():
    #get thequestion from the JSON request sent by React
    data = request.get_json()
    user_question = data.get('question')

    if not user_question:
        return jsonify({"error": "No question provided"}), 400
    
    # system prompt
    system_prompt = f"""
    You are 'Lannz AI', a friendly and helpful AI assistant.
    Your personality should be professional, yet approachable with a touch of humor.

    Use the following information about Lannz to answer questions.
    Do not make up facts, only use the provided information.
    If the question is not related to Lannz, just answer it as a general AI but say that the question is not related to Lannz.

    Here are some facts about Lannz:
    {facts}
"""
    
    try:
        #make the API call to OpenAI
        response = client.chat.completions.create(
            model="llama3",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_question}
            ],
            temperature=0.7,
        )
        answer = response.choices[0].message.content.strip()
        #send answer back to React
        return jsonify({"answer": answer})
    except Exception as e:
        print(f"Error calling ollama: {e}")
        return jsonify({"error": "Failed to get a response from the AI"}), 500
    
# Run the Flask app
if __name__ == '__main__':
    print("Backend server is running on http://localhost:5000")
    print("Make sure Ollama is running.")
    app.run(port=5000)
    


    