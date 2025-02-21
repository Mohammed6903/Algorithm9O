import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
from ollama import AsyncClient

class TimeSlot(Enum):
    EARLY_MORNING = "early_morning"
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"

class ActivityType(Enum):
    STUDY = "study"
    EXERCISE = "exercise"
    MEALS = "meals"
    BREAK = "break"
    SLEEP = "sleep"
    HOBBY = "hobby"
    SELF_CARE = "self_care"

@dataclass
class StudentPreferences:
    wake_up_time: str
    sleep_time: str
    study_hours: int
    exercise_preference: str
    meal_times: List[str]
    hobbies: List[str]
    break_duration: int
    productivity_peak: TimeSlot
    course_load: Dict[str, int]  # subject: hours needed
    special_requirements: Optional[List[str]] = None
    learning_style: Optional[str] = None
    stress_level: Optional[int] = None  # 1-10 scale
    energy_patterns: Optional[Dict[str, int]] = None

class RoutineAssistant:
    def __init__(self):
        self.model = 'llama3.2'
        self.client = AsyncClient()
        self.time_slots = {
            TimeSlot.EARLY_MORNING: (5, 8),
            TimeSlot.MORNING: (8, 12),
            TimeSlot.AFTERNOON: (12, 16),
            TimeSlot.EVENING: (16, 20),
            TimeSlot.NIGHT: (20, 23)
        }

    async def generate_personalized_routine(self, preferences: StudentPreferences) -> Dict:
        """Generate a personalized routine using LLM analysis."""
        prompt = self._construct_prompt(preferences)
        routine = await self._analyze_with_llm(prompt)
        return self._post_process_routine(routine, preferences)

    def _construct_prompt(self, preferences: StudentPreferences) -> str:
        """Construct a detailed prompt for the LLM."""
        student_profile = (
            f"STUDENT PROFILE:\n"
            f"Wake-up Time: {preferences.wake_up_time}\n"
            f"Sleep Time: {preferences.sleep_time}\n"
            f"Study Hours Required: {preferences.study_hours}\n"
            f"Exercise Preference: {preferences.exercise_preference}\n"
            f"Peak Productivity: {preferences.productivity_peak.value}\n"
            f"Learning Style: {preferences.learning_style or 'Not specified'}\n"
            f"Current Stress Level: {preferences.stress_level or 'Not specified'}/10\n"
        )

        course_details = self._format_course_load(preferences.course_load)
        special_needs = self._format_special_requirements(preferences)

        output_requirements = (
            "\nREQUIRED OUTPUT FORMAT:\n"
            "{\n"
            "    \"daily_routine\": {\n"
            "        \"schedule_blocks\": [\n"
            "            {\n"
            "                \"time_slot\": \"HH:MM-HH:MM\",\n"
            "                \"activity\": \"Activity name\",\n"
            "                \"type\": \"ActivityType\",\n"
            "                \"energy_level\": 1-10,\n"
            "                \"details\": [\"detail1\", \"detail2\"],\n"
            "                \"optimization_tips\": [\"tip1\", \"tip2\"],\n"
            "                \"alternatives\": [\"alt1\", \"alt2\"]\n"
            "            }\n"
            "        ],\n"
            "        \"wellness_recommendations\": {\n"
            "            \"stress_management\": [\"recommendation1\", \"recommendation2\"],\n"
            "            \"energy_optimization\": [\"tip1\", \"tip2\"],\n"
            "            \"work_life_balance\": [\"suggestion1\", \"suggestion2\"]\n"
            "        },\n"
            "        \"adaptation_strategies\": {\n"
            "            \"low_energy_days\": [\"strategy1\", \"strategy2\"],\n"
            "            \"high_stress_periods\": [\"strategy1\", \"strategy2\"],\n"
            "            \"unexpected_changes\": [\"strategy1\", \"strategy2\"]\n"
            "        },\n"
            "        \"success_metrics\": {\n"
            "            \"daily_goals\": [\"goal1\", \"goal2\"],\n"
            "            \"progress_indicators\": [\"indicator1\", \"indicator2\"],\n"
            "            \"adjustment_triggers\": [\"trigger1\", \"trigger2\"]\n"
            "        }\n"
            "    }\n"
            "}\n"
        )

        optimization_requirements = (
            "\nOPTIMIZATION REQUIREMENTS:\n"
            "1. Maximize productivity during peak hours\n"
            "2. Balance study and breaks effectively\n"
            "3. Account for energy patterns throughout the day\n"
            "4. Include buffer time for unexpected events\n"
            "5. Maintain consistent meal and exercise times\n"
            "6. Consider stress management and mental health\n"
            "7. Allow flexibility for social and recreational activities\n"
        )

        return (
            "You are an experienced academic coach and wellness expert creating a personalized "
            "daily routine for a student. Your goal is to optimize their schedule for both "
            "academic success and overall well-being.\n\n"
            f"{student_profile}\n"
            f"COURSE LOAD AND REQUIREMENTS:\n{course_details}\n\n"
            f"SPECIAL CONSIDERATIONS:\n{special_needs}\n\n"
            f"{output_requirements}\n"
            f"{optimization_requirements}\n"
        )

    def _format_course_load(self, course_load: Dict[str, int]) -> str:
        """Format course load information for the prompt."""
        formatted = []
        total_hours = sum(course_load.values())
        for subject, hours in course_load.items():
            percentage = (hours / total_hours) * 100
            formatted.append(
                f"- {subject}:\n"
                f"  Hours Required: {hours}\n"
                f"  Percentage of Total Load: {percentage:.1f}%"
            )
        return "\n".join(formatted)

    def _format_special_requirements(self, preferences: StudentPreferences) -> str:
        """Format special requirements and preferences."""
        requirements = []
        
        if preferences.special_requirements:
            requirements.extend(preferences.special_requirements)
            
        if preferences.energy_patterns:
            energy_patterns = [
                f"- {time_slot}: Energy Level {level}/10"
                for time_slot, level in preferences.energy_patterns.items()
            ]
            requirements.append("Energy Patterns:\n" + "\n".join(energy_patterns))
            
        if preferences.learning_style:
            requirements.append(f"Learning Style Considerations: {preferences.learning_style}")
            
        return "\n".join(requirements) if requirements else "No special requirements specified"

    async def _analyze_with_llm(self, prompt: str) -> Dict:
        """Generate personalized routine using LLM asynchronously."""
        try:
            response = await self.client.chat(
                model=self.model,
                messages=[{'role': 'user', 'content': prompt}],
                format='json'
            )
            return json.loads(response['message']['content'])
        except json.JSONDecodeError as e:
            print(f"Error parsing LLM response: {e}")
            return {"error": "Failed to generate valid routine"}
        except Exception as e:
            print(f"Error during LLM analysis: {e}")
            return {"error": str(e)}

    def _post_process_routine(self, routine: Dict, preferences: StudentPreferences) -> Dict:
        """Post-process and validate the LLM-generated routine."""
        if "error" in routine:
            return routine

        processed_routine = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "student_preferences": self._serialize_preferences(preferences),
                "version": "1.0"
            },
            "routine": routine["daily_routine"],
            # "analytics": self._generate_analytics(routine["daily_routine"]),
            "implementation_guide": self._create_implementation_guide(routine["daily_routine"])
        }

        return processed_routine

    def _serialize_preferences(self, preferences: StudentPreferences) -> Dict:
        """Convert preferences to a serializable format."""
        return {
            "wake_up_time": preferences.wake_up_time,
            "sleep_time": preferences.sleep_time,
            "study_hours": preferences.study_hours,
            "exercise_preference": preferences.exercise_preference,
            "productivity_peak": preferences.productivity_peak.value,
            "course_load": preferences.course_load
        }

    def _create_implementation_guide(self, routine: Dict) -> Dict:
        """Create a guide for implementing the routine."""
        return {
            "getting_started": [
                "Review the complete schedule",
                "Prepare necessary materials and spaces",
                "Set up reminders and tracking systems"
            ],
            "adaptation_period": [
                "Start with core activities",
                "Gradually incorporate all elements",
                "Monitor energy levels and adjustment needs"
            ],
            "success_strategies": [
                "Use time-blocking techniques",
                "Maintain a routine journal",
                "Regular weekly reviews"
            ]
        }

# Example usage
async def main():
    # Sample student preferences
    preferences = StudentPreferences(
        wake_up_time="06:00",
        sleep_time="22:00",
        study_hours=8,
        exercise_preference="morning",
        meal_times=["07:30", "12:30", "19:00"],
        hobbies=["reading", "painting", "music"],
        break_duration=15,
        productivity_peak=TimeSlot.MORNING,
        course_load={
            "Mathematics": 3,
            "Physics": 2,
            "Computer Science": 2,
            "English": 1
        },
        learning_style="Visual learner",
        stress_level=6,
        energy_patterns={
            "morning": 8,
            "afternoon": 6,
            "evening": 7
        },
        special_requirements=["Need quiet study environment", "Prefer group study for Physics"]
    )
    
    assistant = RoutineAssistant()
    routine = await assistant.generate_personalized_routine(preferences)
    
    # Print the generated routine
    print(json.dumps(routine, indent=2))

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())