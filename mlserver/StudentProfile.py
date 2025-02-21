# # Added IRT components
# import numpy as np
# from typing import Dict, List, Optional
# from fastapi import HTTPException
# import uuid

# class IRTParameters:
#     """Item Response Theory parameters for questions"""
#     def __init__(self, difficulty: float, discrimination: float = 1.0, guessing: float = 0.0):
#         self.difficulty = difficulty  # b parameter
#         self.discrimination = discrimination  # a parameter
#         self.guessing = guessing  # c parameter

# class StudentIRTProfile:
#     """Student ability profile with IRT tracking"""
#     def __init__(self, student_id: str = "demo_student"):
#         self.student_id = student_id
#         self.theta = 0.0  # Initial ability estimate
#         self.response_history = []  # List of (question_id, correct, irt_params)
#         self.knowledge_graph = {}
        
#     def update_ability(self, question_id: str, correct: bool, irt_params: IRTParameters):
#         """Update theta using Newton-Raphson method"""
#         self.response_history.append((question_id, correct, irt_params))
        
#         # Simple heuristic update for MVP
#         if correct:
#             self.theta += 0.5 * (1 - self._probability_correct(irt_params))
#         else:
#             self.theta -= 0.5 * self._probability_correct(irt_params)
            
#         # Constrain theta to reasonable bounds
#         self.theta = max(-3.0, min(3.0, self.theta))
        
#     def _probability_correct(self, irt_params: IRTParameters) -> float:
#         """Calculate P(θ) using 3PL model"""
#         z = irt_params.discrimination * (self.theta - irt_params.difficulty)
#         return irt_params.guessing + (1 - irt_params.guessing) / (1 + np.exp(-z))

# class StudentProfileManager:
#     """Singleton for managing in-memory student profiles"""
#     _instance = None
    
#     def __new__(cls):
#         if cls._instance is None:
#             cls._instance = super().__new__(cls)
#             cls._instance.profiles = {}
#             cls._instance.init_demo_student()
#         return cls._instance
    
#     def init_demo_student(self):
#         demo_id = "demo_student"
#         self.profiles[demo_id] = StudentIRTProfile(demo_id)
        
#     def get_student(self, student_id: str) -> StudentIRTProfile:
#         if student_id not in self.profiles:
#             raise HTTPException(status_code=404, detail="Student not found")
#         return self.profiles[student_id]
    
#     def update_student(self, student: StudentIRTProfile):
#         self.profiles[student.student_id] = student

# class AdaptiveQuizEngine:
#     """IRT-based quiz adaptation engine"""
#     def __init__(self):
#         self.profile_manager = StudentProfileManager()
        
#     def select_question(self, student_id: str, topic: str) -> Dict:
#         student = self.profile_manager.get_student(student_id)
        
#         # Get questions filtered by topic and closest to student's theta
#         questions = self._get_questions_for_topic(topic)
#         if not questions:
#             raise HTTPException(status_code=404, detail="No questions available for this topic")
            
#         # Select question with difficulty closest to current theta
#         closest = min(questions, key=lambda q: abs(q.irt_params.difficulty - student.theta))
#         return closest.to_dict()
    
#     def process_response(self, student_id: str, question_id: str, correct: bool):
#         student = self.profile_manager.get_student(student_id)
#         question = self._get_question_by_id(question_id)
        
#         student.update_ability(question_id, correct, question.irt_params)
#         self.profile_manager.update_student(student)
        
#         return {
#             "new_theta": student.theta,
#             "mastery_level": self._calculate_mastery(student.theta)
#         }
    
#     def _calculate_mastery(self, theta: float) -> str:
#         if theta < -1: return "beginner"
#         if theta < 1: return "intermediate"
#         return "advanced"
    
#     def _get_questions_for_topic(self, topic: str) -> List[Question]:
#         # Implement your question retrieval logic
#         return static_question_bank.get(topic, [])
    
#     def _get_question_by_id(self, question_id: str) -> Question:
#         # Implement question lookup
#         return question_storage[question_id]