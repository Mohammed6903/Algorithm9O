import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional

# Load environment variables
load_dotenv()

# Get API key from environment variables
API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)

class Debate:
    def __init__(self, topic: str, stance: str, cards: List[str], debate_history: List[Dict] = None):
        self.topic = topic
        self.stance = stance
        self.cards = cards
        self.ai_response = None
        self.debate_history = debate_history or []  # List of {'user': str, 'ai': str}
    
    def generate_ai_response(self, user_input: str = None) -> str:
        """Generate a counter-argument using Gemini, considering debate history and user input."""
        history_context = "\n".join([f"User: {entry['user']}\nAI: {entry['ai']}" for entry in self.debate_history])
        card_prompt = ", ".join(self.cards)
        prompt = f"""
        The user is debating '{self.topic}' and is {self.stance}. Their argument uses: {card_prompt}.
        Debate history: {history_context if history_context else 'No prior context.'}
        Current user input: {user_input if user_input else 'Initial argument.'}
        Provide a concise counter-argument as the opposing side, adapting to the debate context.
        """
        
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        self.ai_response = response.text.strip()
        self.debate_history.append({"user": user_input or f"Initial: {card_prompt}", "ai": self.ai_response})
        return self.ai_response

    def generate_review_and_score(self) -> Dict:
        """Generate a review, scorecard, and improvement suggestions based on debate history."""
        if not self.debate_history:
            return {
                "review": "No debate history available.",
                "scorecard": {"logic": 0, "evidence": 0, "persuasion": 0},
                "suggestions": ["Engage in a debate to receive feedback."]
            }

        # Simple heuristic-based scoring (can be refined with ML or rules)
        logic_score = 0
        evidence_score = 0
        persuasion_score = 0

        for entry in self.debate_history:
            user_input = entry["user"].lower()
            if "logic" in user_input or "reason" in user_input:
                logic_score += 2
            if "stat" in user_input or "data" in user_input:
                evidence_score += 2
            if "feel" in user_input or "believe" in user_input:
                persuasion_score += 2

        # Normalize scores (0-10)
        total_rounds = len(self.debate_history)
        logic_score = min(10, (logic_score / total_rounds) * 2) if total_rounds > 0 else 0
        evidence_score = min(10, (evidence_score / total_rounds) * 2) if total_rounds > 0 else 0
        persuasion_score = min(10, (persuasion_score / total_rounds) * 2) if total_rounds > 0 else 0

        # Generate review and suggestions using Gemini
        review_prompt = f"""
        Analyze this debate history and provide a concise review:
        {self.debate_history}
        Include strengths, weaknesses, and an overall assessment.
        """
        model = genai.GenerativeModel("gemini-pro")
        review_response = model.generate_content(review_prompt)
        review = review_response.text.strip()

        suggestion_prompt = f"""
        Based on this debate history, suggest 3 specific improvements for the student's debating skills:
        {self.debate_history}
        """
        suggestion_response = model.generate_content(suggestion_prompt)
        suggestions = suggestion_response.text.strip().split("\n")[:3]  # Get up to 3 suggestions

        return {
            "review": review,
            "scorecard": {"logic": logic_score, "evidence": evidence_score, "persuasion": persuasion_score},
            "suggestions": suggestions
        }

    def run_debate(self, user_input: str = None) -> str:
        """Run a single debate turn or initial response."""
        return self.generate_ai_response(user_input)

    def end_debate(self) -> Dict:
        """End the debate and return a final review and score."""
        return self.generate_review_and_score()