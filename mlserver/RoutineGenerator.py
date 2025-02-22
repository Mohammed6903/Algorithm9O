import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import google.generativeai as genai
from QuizGenerator import StudentIRT, StaticSyllabus
import uuid

# Configure Gemini API
genai.configure(api_key="AIzaSyAK0XnqsxKZnyJM7oLi3ndeYeO_Gz8WiC8")
model = genai.GenerativeModel('gemini-2.0-flash')

# FastAPI app instance
app = FastAPI()

# In-memory tracking of active tasks
active_tasks: Dict[str, Dict[str, Any]] = {}

# Initialize StudentIRT and StaticSyllabus
student_irt = StudentIRT()
syllabus = StaticSyllabus()

class RoutineRequest(BaseModel):
    age: int
    sleep_time: str  # e.g., "22:00"
    wake_time: str  # e.g., "06:00"
    study_hours: float
    exercise_time: float  # in minutes
    subjects: str  # comma-separated list

class RoutineResponse(BaseModel):
    task_id: str
    status: str
    message: str

class TimeBlock(BaseModel):
    start_time: str
    end_time: str
    activity: str
    description: str

class StudyPlanDetail(BaseModel):
    time_slot: str
    duration: str
    focus_areas: List[str]
    recommended_resources: List[str]

class PerformanceMetric(BaseModel):
    time: str
    productivity: float
    energy: float

class DetailedRoutine(BaseModel):
    morning_routine: str
    study_plan: Dict[str, str]
    exercise: str
    evening_routine: str
    productivity_tips: str
    performance_metrics: List[Dict[str, Any]]
    schedule_blocks: List[Dict[str, str]]

class RoutineGenerator:
    def __init__(self):
        self.ai_client = model

    def _get_student_performance(self) -> Dict[str, Any]:
        """Fetch and analyze student performance data from StudentIRT."""
        history = student_irt.get_quiz_history()
        total_score = sum(quiz["score"] for quiz in history.values())
        total_marks = sum(quiz["total_marks"] for quiz in history.values())
        avg_percentage = (total_score / total_marks * 100) if total_marks > 0 else 0
        ability = student_irt.get_ability()
        level = student_irt.get_level()

        subject_performance = {}
        for quiz_id, quiz in history.items():
            subject = quiz_id.split('_')[0]
            if subject not in subject_performance:
                subject_performance[subject] = {"score": 0, "total": 0, "count": 0}
            subject_performance[subject]["score"] += quiz["score"]
            subject_performance[subject]["total"] += quiz["total_marks"]
            subject_performance[subject]["count"] += 1

        return {
            "avg_percentage": avg_percentage,
            "ability": ability,
            "level": level,
            "subject_performance": {
                subj: {
                    "avg_score": data["score"] / data["count"],
                    "percentage": (data["score"] / data["total"] * 100) if data["total"] > 0 else 0
                } for subj, data in subject_performance.items()
            }
        }

    def _generate_performance_metrics(self, wake_time: str, sleep_time: str) -> List[Dict[str, Any]]:
        """Generate time-based performance metrics for the daily chart."""
        def time_to_hours(time_str: str) -> float:
            hours, minutes = map(int, time_str.split(':'))
            return hours + minutes / 60

        wake_hour = time_to_hours(wake_time)
        sleep_hour = time_to_hours(sleep_time)
        
        # Adjust sleep_hour if it's before wake_hour (next day)
        if sleep_hour < wake_hour:
            sleep_hour += 24

        metrics = []
        current_hour = wake_hour

        # Define key points in the day
        while current_hour <= sleep_hour:
            hour = int(current_hour % 24)
            minute = int((current_hour % 1) * 60)
            time_str = f"{hour:02d}:{minute:02d}"

            # Calculate productivity and energy based on time of day
            hours_awake = current_hour - wake_hour
            energy = 100 * (1 - (hours_awake / (sleep_hour - wake_hour))**2)
            productivity = energy * (1 + 0.2 * min(hours_awake, 4))  # Peak in first 4 hours

            metrics.append({
                "time": time_str,
                "productivity": min(100, max(50, productivity)),
                "energy": min(100, max(50, energy))
            })

            current_hour += 3  # 3-hour intervals

        return metrics

    async def generate_routine(self, request: RoutineRequest) -> Dict[str, Any]:
        """Generate a comprehensive daily routine with performance metrics."""
        performance = self._get_student_performance()
        subjects_list = [s.strip() for s in request.subjects.split(',')]
        
        # Generate performance metrics for the chart
        performance_metrics = self._generate_performance_metrics(request.wake_time, request.sleep_time)

        prompt = f"""
        Create a detailed daily routine for a {request.age}-year-old student with the following schedule:
        - Wake Time: {request.wake_time}
        - Sleep Time: {request.sleep_time}
        - Study Hours: {request.study_hours} hours
        - Exercise Time: {request.exercise_time} minutes
        - Subjects: {', '.join(subjects_list)}

        Student Performance Data:
        - Average Performance: {performance['avg_percentage']:.2f}%
        - Ability Level: {performance['level']}
        - Subject Performance: {json.dumps(performance['subject_performance'], indent=2)}

        Format the response as a JSON object with the following structure:
        {{
            "morning_routine": "Detailed description of morning activities",
            "study_plan": {{
                "subject_name": "specific time allocation and schedule"
            }},
            "exercise": "Exercise routine description",
            "evening_routine": "Evening routine description",
            "productivity_tips": "Personalized productivity advice",
            "schedule_blocks": [
                {{
                    "start_time": "HH:MM",
                    "end_time": "HH:MM",
                    "activity": "Brief activity name",
                    "description": "Detailed description"
                }}
            ]
        }}

        Ensure each time block is specific and accounts for breaks and transitions.
        """

        try:
            response = await asyncio.to_thread(
                self.ai_client.generate_content,
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            
            routine_data = json.loads(response.text)
            
            # Add performance metrics to the response
            routine_data["performance_metrics"] = performance_metrics
            
            return routine_data

        except Exception as e:
            raise RuntimeError(f"Failed to generate routine: {str(e)}")