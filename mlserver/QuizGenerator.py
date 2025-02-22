import os
import json
import asyncio
from typing import Dict, Optional, List, Any
from datetime import datetime
import google.generativeai as genai
import numpy as np

# Configure Gemini API
genai.configure(api_key="AIzaSyAK0XnqsxKZnyJM7oLi3ndeYeO_Gz8WiC8")
model = genai.GenerativeModel('gemini-2.0-flash')

# StaticSyllabus class (unchanged)
class StaticSyllabus:
    def __init__(self):
        self.syllabus = self._load_static_syllabus()
        
    def _load_static_syllabus(self) -> Dict[str, Dict]:
        return {
            "Mathematics": {
                "Algebra": {
                    "content": ["Linear Equations", "Quadratic Equations", "Arithmetic Progression"],
                    "difficulty_levels": {"basic": 1, "intermediate": 2, "advanced": 3},
                    "weightage": 35,
                    "learning_objectives": [
                        "Solve linear equations in two variables",
                        "Understand quadratic equations and their roots",
                        "Master arithmetic and geometric progressions"
                    ]
                },
                "Geometry": {
                    "content": ["Similarity", "Pythagoras Theorem", "Circle"],
                    "difficulty_levels": {"basic": 1, "intermediate": 2, "advanced": 3},
                    "weightage": 30,
                    "learning_objectives": [
                        "Apply similarity criteria to geometric problems",
                        "Solve problems using Pythagoras theorem",
                        "Understand circle theorems and applications"
                    ]
                },
            },
            "Science": {
                "Physics": {
                    "content": ["Gravitation", "Periodic Classification", "Electromagnetism"],
                    "difficulty_levels": {"basic": 1, "intermediate": 2, "advanced": 3},
                    "weightage": 25,
                    "learning_objectives": [
                        "Understand universal law of gravitation",
                        "Classify elements using periodic table",
                        "Solve numericals on electromagnetic induction"
                    ]
                },
                "Chemistry": {
                    "content": ["Acids and Bases", "Chemical Reactions", "Oxidation and Reduction"],
                    "difficulty_levels": {"basic": 1, "intermediate": 2, "advanced": 3},
                    "weightage": 25,
                    "learning_objectives": [
                        "Identify properties of acids and bases",
                        "Balance chemical reactions",
                        "Understand oxidation-reduction processes"
                    ]
                },
                "Biology": {
                    "content": ["Life Processes", "Control in the Living", "Reproduction in the Living"],
                    "difficulty_levels": {"basic": 1, "intermediate": 2, "advanced": 3},
                    "weightage": 25,
                    "learning_objectives": [
                        "Understand human circulatory and respiratory systems",
                        "Learn about nervous and hormonal control",
                        "Study different modes of reproduction in living organisms"
                    ]
                },
            },
            "Social Science": {
                "History": {
                    "content": ["Imperialism", "20th Century Age of Conflict", "Emancipation of Asia and Africa"],
                    "difficulty_levels": {"basic": 1, "intermediate": 2, "advanced": 3},
                    "weightage": 25,
                    "learning_objectives": [
                        "Analyze the impact of imperialism on global history",
                        "Understand the causes and effects of world wars",
                        "Study the movements leading to independence in Asia and Africa"
                    ]
                },
                "Geography": {
                    "content": ["Physical Features of India", "Climate", "Natural Resources"],
                    "difficulty_levels": {"basic": 1, "intermediate": 2, "advanced": 3},
                    "weightage": 25,
                    "learning_objectives": [
                        "Identify major physical features of India",
                        "Understand the climate patterns and their effects",
                        "Learn about the distribution and conservation of natural resources"
                    ]
                },
                "Economics": {
                    "content": ["Development", "Sectors of the Indian Economy", "Money and Credit"],
                    "difficulty_levels": {"basic": 1, "intermediate": 2, "advanced": 3},
                    "weightage": 25,
                    "learning_objectives": [
                        "Understand the concept of development and its indicators",
                        "Analyze the role of different sectors in the economy",
                        "Learn about the banking system and credit facilities"
                    ]
                },
                "Political Science": {
                    "content": ["Democracy and Diversity", "Political Parties", "Outcomes of Democracy"],
                    "difficulty_levels": {"basic": 1, "intermediate": 2, "advanced": 3},
                    "weightage": 25,
                    "learning_objectives": [
                        "Understand the principles of democracy",
                        "Study the role and functions of political parties",
                        "Evaluate the outcomes and challenges of democratic governance"
                    ]
                },
            },
            "Languages": {
                "English": {
                    "content": ["Prose", "Poetry", "Grammar"],
                    "difficulty_levels": {"basic": 1, "intermediate": 2, "advanced": 3},
                    "weightage": 25,
                    "learning_objectives": [
                        "Enhance reading comprehension skills",
                        "Appreciate and analyze poetic expressions",
                        "Master grammatical structures and usage"
                    ]
                },
                "Marathi": {
                    "content": ["Prose", "Poetry", "Grammar"],
                    "difficulty_levels": {"basic": 1, "intermediate": 2, "advanced": 3},
                    "weightage": 25,
                    "learning_objectives": [
                        "Develop reading and writing skills in Marathi",
                        "Understand and interpret Marathi literature",
                        "Apply grammatical rules in writing"
                    ]
                },
                "Hindi": {
                    "content": ["Prose", "Poetry", "Grammar"],
                    "difficulty_levels": {"basic": 1, "intermediate": 2, "advanced": 3},
                    "weightage": 25,
                    "learning_objectives": [
                        "Improve proficiency in reading and writing Hindi",
                        "Analyze Hindi literary works",
                        "Grasp and use Hindi grammar effectively"
                    ]
                },
            },
            "Information Technology": {
                "content": ["ICT in Daily Life", "Digital Literacy", "Cyber Safety"],
                "difficulty_levels": {"basic": 1, "intermediate": 2, "advanced": 3},
                "weightage": 25,
                "learning_objectives": [
                    "Understand the role of ICT in modern society",
                    "Develop skills in using digital tools and platforms",
                    "Learn about online safety and responsible internet usage"
                ]
            },
        }

    def get_topic_content(self, subject: str, topic: str) -> Optional[Dict]:
        return self.syllabus.get(subject, {}).get(topic)
    
    def get_subjects(self) -> List[str]:
        """Return a list of all subjects in the syllabus."""
        return list(self.syllabus.keys())

    def generate_ai_prompt(self, student_level: str, subject: str, topic: str = None) -> str:
        base_prompt = f"Generate SSC Maharashtra Class 10 level questions for {subject}. Focus more on tricky MCQs, True False Questions."
        if topic:
            base_prompt += f" topic: {topic}"
            
        level_based = {
            "basic": "Include simple recall questions and basic problem solving",
            "intermediate": "Mix of conceptual questions and moderate difficulty problems",
            "advanced": "Challenging application-based questions and HOTS (Higher Order Thinking Skills)"
        }.get(student_level, "intermediate")

        base_prompt = base_prompt + level_based
        
        syllabus_snippet = ""
        if topic:
            topic_data = self.get_topic_content(subject, topic)
            if topic_data:
                syllabus_snippet = f"""
                Syllabus Details:
                - Key Concepts: {', '.join(topic_data['content'])}
                - Learning Objectives: {', '.join(topic_data['learning_objectives'])}
                - Weightage: {topic_data['weightage']}% of total marks
                """
                
        return f"""
        {base_prompt}. Student level: {student_level}.
        {syllabus_snippet}
        Follow these guidelines:
        - Include multiple question types (MCQs, true false)
        - Mark scheme with step-by-step solutions
        - Difficulty progression within the quiz
        - Align with SSC Maharashtra board patterns
        - Include real-world application questions where applicable
        - Return in JSON format: 
          {{
            "questions": [
              {{
                "text": "question text",
                "type": "MCQ/short/true false",
                "options": ["option1", "option2", ...] (for MCQs),
                "answer": "correct answer",
                "difficulty": "basic/intermediate/advanced",
                "marks": number,
                "solution": "step-by-step solution"
              }}
            ]
          }}
        """

# StudentIRT class (unchanged)
class StudentIRT:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(StudentIRT, cls).__new__(cls)
            cls._instance.theta = 0.0
            cls._instance.history = []
            cls._instance.quiz_results = {}
        return cls._instance

    def update_ability(self, question_id: str, response: bool, a: float, b: float):
        self.history.append({"question_id": question_id, "response": response, "a": a, "b": b})
        theta_new = self.theta
        for _ in range(10):
            numerator = 0.0
            denominator = 0.0
            for h in self.history:
                logit = h["a"] * (theta_new - h["b"])
                clipped_logit = np.clip(logit, -500, 500)
                p = 1 / (1 + np.exp(-clipped_logit))
                numerator += h["a"] * (h["response"] - p)
                denominator += h["a"]**2 * p * (1 - p)
            if denominator == 0:
                break
            theta_new += numerator / denominator
            theta_new = np.clip(theta_new, -10, 10)
        self.theta = theta_new

    def get_ability(self) -> float:
        return self.theta

    def get_level(self) -> str:
        if self.theta <= 0:
            return "basic"
        elif self.theta < 1:
            return "intermediate"
        else:
            return "advanced"

    def record_quiz(self, quiz_id: str, score: float, total_marks: float, questions: List[Dict]):
        self.quiz_results[quiz_id] = {
            "score": score,
            "total_marks": total_marks,
            "questions": questions,
            "timestamp": datetime.now().isoformat()
        }

    def get_quiz_history(self) -> Dict:
        return self.quiz_results

class AISyllabusQuizGenerator:
    def __init__(self, syllabus_handler: StaticSyllabus):
        self.syllabus = syllabus_handler
        self.ai_client = model
        self.student = StudentIRT()

    async def generate_quiz(self, subject: str, topic: str = None) -> Dict:
        student_level = self.student.get_level()
        prompt = self.syllabus.generate_ai_prompt(student_level, subject, topic)
        
        try:
            response = await asyncio.to_thread(
                self.ai_client.generate_content,
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            quiz_data = json.loads(response.text)
            quiz = self._format_quiz(quiz_data, subject, topic)
            # Record quiz immediately with initial score 0
            total_marks = sum(q["marks"] for q in quiz["questions"])
            self.student.record_quiz(quiz["quiz_id"], 0, total_marks, quiz["questions"])
            return quiz
        except Exception as e:
            raise RuntimeError(f"AI Generation failed: {str(e)}")
            
    def _format_quiz(self, raw_response: Dict, subject: str, topic: str) -> Dict:
        quiz_id = f"{subject}_{topic or 'general'}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        questions = []
        
        for idx, q in enumerate(raw_response.get("questions", [])):
            difficulty_map = {"basic": -1.0, "intermediate": 0.0, "advanced": 1.0}
            b = difficulty_map.get(q["difficulty"], 0.0)
            a = 1.0 + np.random.uniform(0, 0.5)
            question_id = f"{quiz_id}_q{idx}"
            
            questions.append({
                "question_id": question_id,
                "text": q["text"],
                "type": q["type"],
                "options": q.get("options", []),
                "correct_answer": q["answer"],
                "difficulty": q["difficulty"],
                "marks": q["marks"],
                "solution_steps": q["solution"],
                "irt_a": a,
                "irt_b": b
            })
        
        return {
            "quiz_id": quiz_id,
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "board": "SSC Maharashtra",
                "class": "10",
                "subject": subject,
                "topic": topic,
                "student_level": self.student.get_level(),
                "student_ability": self.student.get_ability()
            },
            "questions": questions
        }

    async def evaluate_quiz(self, quiz_id: str, responses: Dict[str, Any]) -> Dict:
        quiz = self.student.get_quiz_history().get(quiz_id)
        if not quiz:
            raise ValueError(f"Quiz {quiz_id} not found in student history.")
        
        score = 0
        total_marks = sum(q["marks"] for q in quiz["questions"])
        
        for q in quiz["questions"]:
            student_answer = responses.get(q["question_id"])
            correct = student_answer == q["correct_answer"]
            score += q["marks"] if correct else 0
            self.student.update_ability(q["question_id"], correct, q["irt_a"], q["irt_b"])
        
        self.student.record_quiz(quiz_id, score, total_marks, quiz["questions"])
        
        return {
            "quiz_id": quiz_id,
            "score": score,
            "total_marks": total_marks,
            "percentage": (score / total_marks) * 100,
            "updated_ability": self.student.get_ability(),
            "updated_level": self.student.get_level()
        }

async def main():
    # Initialize generator
    syllabus = StaticSyllabus()
    quiz_gen = AISyllabusQuizGenerator(syllabus)
    
    # Generate a quiz
    quiz = await quiz_gen.generate_quiz("Mathematics", "Algebra")
    print("Generated Quiz:", json.dumps(quiz, indent=2))
    
    # Record the quiz in student history (fix: add this step before evaluation)
    total_marks = sum(q["marks"] for q in quiz["questions"])
    quiz_gen.student.record_quiz(quiz["quiz_id"], 0, total_marks, quiz["questions"])  # Initial score 0
    
    # Simulate student responses
    responses = {
        q["question_id"]: q["correct_answer"] if i % 2 == 0 else "wrong" 
        for i, q in enumerate(quiz["questions"])
    }
    
    # Evaluate the quiz
    result = await quiz_gen.evaluate_quiz(quiz["quiz_id"], responses)
    print("Quiz Result:", json.dumps(result, indent=2))
    
    # Generate another quiz to show updated ability
    quiz2 = await quiz_gen.generate_quiz("Mathematics", "Geometry")
    print("New Quiz with Updated Ability:", json.dumps(quiz2, indent=2))
    
    # Show student history
    print("Student History:", json.dumps(quiz_gen.student.get_quiz_history(), indent=2))

if __name__ == "__main__":
    asyncio.run(main())