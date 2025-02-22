import os
from dotenv import load_dotenv
from typing import List, Dict, Optional
import google.generativeai as genai
import json
import networkx as nx
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import wordnet
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import logging

# Load environment variables
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Ensure NLTK resources are downloaded before anything else
def ensure_nltk_resources():
    try:
        nltk.data.find('tokenizers/punkt_tab')
    except LookupError:
        print("Downloading 'punkt_tab'...")
        nltk.download('punkt_tab', quiet=True)
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        print("Downloading 'punkt'...")
        nltk.download('punkt', quiet=True)
    try:
        nltk.data.find('corpora/wordnet')
    except LookupError:
        print("Downloading 'wordnet'...")
        nltk.download('wordnet', quiet=True)

# Call this immediately when the module loads
ensure_nltk_resources()

class MicroGoalOptimizer:
    def __init__(self, learning_objective: str, interests: List[str], engagement_data: List[Dict]):
        self.learning_objective = learning_objective  # e.g., "Master Coding"
        self.interests = interests  # e.g., ["coding", "robotics"]
        self.engagement_data = engagement_data  # May be empty
        self.micro_goals = self.generate_initial_micro_goals()
        self.knowledge_graph = self.build_knowledge_graph()
        self.dp_table = {}  # Dynamic programming table for optimal sequencing
        self.model = self.train_gradient_boosting_model()  # Initialize gradient boosting model

    def train_gradient_boosting_model(self):
        # Dummy training data (you'd need real historical data for accuracy)
        X = np.array([[0.5, 0.5, 0.5, 1], [0.7, 0.3, 0.6, 2], [0.9, 0.2, 0.8, 3]])  # [score, time, interactions, difficulty]
        y = np.array([0, 1, 1])  # 1 for success, 0 for failure
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        model = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
        model.fit(X_train_scaled, y_train)
        return model, scaler  # Return both model and scaler for prediction

    def predict_success(self, goal: Dict) -> float:
        # Predict success probability using gradient boosting, handling empty engagement_data
        engagement = next((e for e in self.engagement_data if e["topic"].lower() in goal["goal"].lower()), None)
        if engagement:
            score = engagement["engagement_score"] / 100  # Normalize 0-1
            time = min(1.0, engagement["time_spent"] / 15)  # Normalize time (e.g., 15 min max = 1.0)
            interactions = len(engagement["interactions"]) / 5  # Normalize interactions (e.g., max 5 = 1.0)
            features = np.array([[score, 1 - time, interactions, goal["difficulty"]]])
            features_scaled = self.model[1].transform(features)  # Scale features
            success_prob = self.model[0].predict_proba(features_scaled)[:, 1][0]  # Probability of success (class 1)
            return max(0.1, min(0.9, success_prob))
        return 0.5  # Default probability for beginners if no engagement data

    def build_knowledge_graph(self) -> nx.DiGraph:
        # Dynamically create a directed graph for knowledge relationships based on learning objective
        G = nx.DiGraph()
        # Use Gemini to generate a knowledge graph dynamically, specifically for coding
        prompt = f"""
        Generate a directed graph (as edges) representing knowledge relationships for the learning objective: "{self.learning_objective}".
        Each edge should represent a prerequisite relationship (e.g., "Learn basic variables" -> "Write a simple function" means writing a function requires learning variables).
        Focus on coding-related skills (e.g., Python, JavaScript, HTML/CSS) if "Coding" or similar is in the objective.
        Consider interests: {self.interests} and return JSON with a list of tuples (e.g., [["Learn variables", "Write a function"], ["Write a function", "Create a script"]]).
        If no specific engagement data is provided, assume a beginner-level coding student.
        """
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        logger.debug(f"Gemini Response for Knowledge Graph: {response.text}")
        try:
            edges = json.loads(response.text)
            G.add_edges_from(edges)
        except json.JSONDecodeError:
            logger.error("Failed to parse Gemini response for knowledge graph")
            # Fallback: Use WordNet and interests for basic relationships if Gemini fails, assuming beginner coding
            objective_words = word_tokenize(self.learning_objective.lower())
            for word in objective_words:
                if "coding" in word or any(interest in word for interest in self.interests):
                    G.add_edge(f"Learn basic {word}", f"Apply {word} in a simple project")
        return G

    def generate_initial_micro_goals(self) -> List[Dict]:
        # Use Gemini to dynamically generate out-of-the-box, non-quiz-based micro-goals for coding or other objectives, even with empty engagement_data
        engagement_summary = {
            "topics": [e["topic"] for e in self.engagement_data] if self.engagement_data else ["coding basics"],
            "avg_engagement": np.mean([e["engagement_score"] for e in self.engagement_data]) if self.engagement_data else 50,
            "total_time": sum(e["time_spent"] for e in self.engagement_data) if self.engagement_data else 0
        }
        
        prompt = f"""
        Generate a list of 5-7 creative, out-of-the-box, non-quiz-based micro-goals for the learning objective: "{self.learning_objective}".
        Each micro-goal should be a practical, engaging task or project (e.g., "Write a Python script to generate a random password," "Create a simple JavaScript game using loops" for "Master Coding").
        Each micro-goal should have a 'goal' (string), 'difficulty' (1-3, integer), and 'prerequisites' (list of strings, can be empty).
        Do not include any expected answers or quiz-style questions—focus on tasks, projects, or explorations.
        Focus on coding-related skills (e.g., Python, JavaScript, HTML/CSS) if "Coding" or similar is in the objective.
        Consider interests: {self.interests}, student engagement: {engagement_summary}, and ensure goals build progressively from easy to challenging.
        If no engagement data is provided, assume a beginner-level coding student with basic knowledge of programming concepts.
        Return JSON with a list of dictionaries.
        """
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        logger.debug(f"Gemini Response for Micro-Goals: {response.text}")
        try:
            goals = json.loads(response.text)
            # Refine with knowledge graph for structure
            refined_goals = []
            for i, g in enumerate(goals):
                goal = g.get("goal", f"Task {i+1}")
                difficulty = max(1, min(3, g.get("difficulty", 1) - (engagement_summary["avg_engagement"] / 100)))  # Adjust difficulty based on engagement
                prerequisites = g.get("prerequisites", [])
                # Ensure prerequisites exist in the graph
                valid_prereqs = [p for p in prerequisites if p in self.knowledge_graph.nodes]
                refined_goals.append({
                    "goal": goal,
                    "difficulty": max(1, min(3, int(difficulty))),  # Ensure 1-3
                    "prerequisites": valid_prereqs
                })
            # Sort by graph traversal for progression
            sorted_goals = []
            visited = set()
            def dfs(node):
                if node in visited:
                    return
                visited.add(node)
                for g in refined_goals:
                    if g["goal"] == node:
                        sorted_goals.append(g)
                        for next_node in self.knowledge_graph.successors(node):
                            dfs(next_node)
            for goal in refined_goals:
                if not goal["prerequisites"]:
                    dfs(goal["goal"])
            return sorted_goals[:7]  # Limit to 7 for simplicity
        except json.JSONDecodeError:
            logger.error("Failed to parse Gemini response for micro-goals")
            # Fallback: Generate beginner-level coding micro-goals if Gemini fails
            if "coding" in self.learning_objective.lower():
                return [
                    {"goal": "Learn basic Python variables", "difficulty": 1, "prerequisites": []},
                    {"goal": "Write a Python script to print 'Hello, World!'", "difficulty": 1, "prerequisites": ["Learn basic Python variables"]},
                    {"goal": "Create a simple loop in JavaScript", "difficulty": 2, "prerequisites": ["Write a Python script to print 'Hello, World!'"]},
                ]
            return []  # Return empty for other objectives, prompting user to refine

    def dynamic_programming_sequence(self) -> List[Dict]:
        # Use dynamic programming to sequence micro-goals optimally
        n = len(self.micro_goals)
        if n == 0:
            return []

        # DP table: dp[i][j] = max progress up to goal i with difficulty j
        dp = {}
        prev = {}

        for i in range(n):
            goal = self.micro_goals[i]
            success_prob = self.predict_success(goal)
            difficulty = goal["difficulty"]
            # Initialize or update DP state
            for prereq in goal["prerequisites"]:
                prereq_idx = next((j for j, g in enumerate(self.micro_goals) if g["goal"] == prereq), -1)
                if prereq_idx == -1:
                    continue
                for prev_diff in range(1, 4):  # Max difficulty 3
                    key = (prereq_idx, prev_diff)
                    if key in dp:
                        new_progress = dp[key] + success_prob * (4 - difficulty)  # Higher success, lower difficulty = better
                        if (i, difficulty) not in dp or new_progress > dp[(i, difficulty)]:
                            dp[(i, difficulty)] = new_progress
                            prev[(i, difficulty)] = key

        # Backtrack to find optimal sequence
        sequence = []
        max_progress = max((v for k, v in dp.items() if k[0] == n-1), default=0)
        if max_progress == 0:
            return self.micro_goals[:3]  # Default to first 3 goals if no progress

        curr = max((k for k, v in dp.items() if k[0] == n-1 and v == max_progress), default=(0, 1))
        while curr in prev:
            sequence.insert(0, self.micro_goals[curr[0]])
            curr = prev[curr]
        return sequence

    def adjust_difficulty(self, completed_goal: Dict, performance: Dict) -> List[Dict]:
        # Adjust micro-goals based on engagement performance using gradient boosting insights
        time = min(1.0, performance.get("time_spent", 0) / 15)  # Normalize time
        score = performance.get("engagement_score", 0) / 100  # Normalize engagement
        interactions = len(performance.get("interactions", [])) / 5  # Normalize interactions
        confidence = score * (1 - time) * interactions

        new_goals = []
        for goal in self.micro_goals:
            if goal["goal"] == completed_goal["goal"]:
                # Use gradient boosting to predict if adjustment is needed
                success_prob = self.predict_success(goal)
                adjustment = 0.5 if confidence < 0.7 or success_prob < 0.6 else -0.5  # More nuanced adjustment
                new_difficulty = max(1, min(3, goal["difficulty"] + adjustment))
                new_goals.append({**goal, "difficulty": new_difficulty})
            else:
                new_goals.append(goal)
        return new_goals

    def generate_micro_goals(self) -> Dict:
        # Dynamically generate and sequence micro-goals
        sequence = self.dynamic_programming_sequence()
        if not sequence:
            return {
                "micro_goals": self.generate_initial_micro_goals()[:3],
                "suggestions": ["Start with exploring basic concepts to build confidence!", "Try a simple project next!", "Leverage your interests to create something unique!"],
                "progress": 0
            }

        # Adjust based on last engagement (if available)
        if self.engagement_data:
            last_engagement = self.engagement_data[-1]
            self.micro_goals = self.adjust_difficulty(sequence[0], last_engagement)
            sequence = self.dynamic_programming_sequence()

        suggestions = [
            f"Start with '{sequence[0]['goal']}' to build momentum!",
            f"Challenge yourself with '{sequence[1]['goal']}' next!",
            f"Use your {self.interests[0]} interest to tackle '{sequence[2]['goal']}'!"
        ]

        return {
            "micro_goals": sequence[:3],
            "suggestions": suggestions,
            "progress": sum(g["difficulty"] for g in sequence[:3]) / 9  # Progress 0-1 (max difficulty 3 * 3 goals)
        }



