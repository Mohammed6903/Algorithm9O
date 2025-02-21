import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment variables
API_KEY = os.getenv("GOOGLE_API_KEY")

# Configure Gemini with the API key
genai.configure(api_key=API_KEY)

class Debate:
    def __init__(self, topic: str, stance: str, cards: list[str]):
        self.topic = topic
        self.stance = stance
        self.cards = cards
        self.ai_response = None

    def generate_ai_response(self):
        """Generate a counter-argument using Gemini."""
        card_prompt = ", ".join(self.cards)
        prompt = f"The user is debating '{self.topic}' and is {self.stance}. Their argument uses: {card_prompt}. Provide a concise counter-argument as the opposing side."
        
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        self.ai_response = response.text
        return self.ai_response

    def run_debate(self):
        """Run the debate process: generate AI response only."""
        return self.generate_ai_response()