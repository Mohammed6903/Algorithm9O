from fastapi import FastAPI, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from pathlib import Path
import asyncio
import shutil
import uuid
from typing import Dict, List
from typing import Dict, Optional
from pydantic import BaseModel
from lectures import MediaProcessor
from examPrepAssistant import ExamPrepAssistant
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from debate import Debate
<<<<<<< HEAD
from typing import List, Dict, Optional
from micro_goals import MicroGoalOptimizer

=======
from QuizGenerator import StaticSyllabus, AISyllabusQuizGenerator, StudentIRT
from RoutineGenerator import RoutineGenerator

routine_generator = RoutineGenerator()

student_irt = StudentIRT()
syllabus = StaticSyllabus()
>>>>>>> 2e67738e33ec8c846692d66f940bbaa3ee03478c

app = FastAPI(title="Media Processing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # List of origins that are allowed to make requests
    allow_credentials=True,
    allow_methods=["*"],  # Allowed HTTP methods
    allow_headers=["*"],  # Allowed headers
)

# Store active processing tasks
active_tasks: Dict[str, dict] = {}

class ProcessingResponse(BaseModel):
    task_id: str
    status: str
    message: str

class ProcessingResult(BaseModel):
    transcript_path: str
    analysis_path: str
    keyframes_dir: str

class Material(BaseModel):
    filename: str
    type: str
    description: str
    date_added: str
    topics: List[str]
    difficulty: str = "Intermediate"

class Module(BaseModel):
    weight: str
    objectives: List[str]

class Syllabus(BaseModel):
    course_name: str
    exam_type: str
    exam_date: str
    duration: str
    format: str
    modules: Dict[str, Module]

class ExamPrepRequest(BaseModel):
    course_materials: List[Material]
    syllabus: Syllabus


# Initialize MediaProcessor
processor = MediaProcessor(base_dir="media_storage")
prep_assistant = ExamPrepAssistant()

async def process_video_task(task_id: str, file_path: Path):
    try:
        result = await processor.process_media(file_path)
        active_tasks[task_id] = {
            "status": "completed",
            "result": result
        }
    except Exception as e:
        active_tasks[task_id] = {
            "status": "failed",
            "error": str(e)
        }
    finally:
        # Cleanup uploaded file
        if file_path.exists():
            file_path.unlink()

async def generate_transcript_task(task_id: str, file_path: Path):
    try:
        result = await processor.generate_transcript(file_path)
        active_tasks[task_id] = {
            "status": "completed",
            "result": result
        }
    except Exception as e:
        active_tasks[task_id] = {
            "status": "failed",
            "error": str(e)
        }
    finally:
        if file_path.exists():
            file_path.unlink()

async def generate_analysis_task(task_id: str, file_path: Path):
    try:
        result = await processor.analyze_transcript(file_path)
        active_tasks[task_id] = {
            "status": "completed",
            "result": result
        }
    except Exception as e:
        active_tasks[task_id] = {
            "status": "failed",
            "error": str(e)
        }
    finally:
        if file_path.exists():
            file_path.unlink()

async def get_images_task(task_id: str, file_path: Path, analysis_path):
    try:
        result = await processor.extract_keyframes(file_path, analysis_path=analysis_path)
        active_tasks[task_id] = {
            "status": "completed",
            "result": result
        }
    except Exception as e:
        active_tasks[task_id] = {
            "status": "failed",
            "error": str(e)
        }
    finally:
        if file_path.exists():
            file_path.unlink()

@app.post("/generate-transcript", response_model=ProcessingResponse)
async def genereate_transcript(
    background_tasks: BackgroundTasks,
    file: UploadFile
):
    if not file.filename.endswith('.mp4'):
        raise HTTPException(status_code=400, detail="Only MP4 files are supported")

    # Create unique task ID
    task_id = str(uuid.uuid4())
    
    # Save uploaded file
    file_path = Path(f"media_storage/temp/{task_id}_{file.filename}")
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Initialize task status
    active_tasks[task_id] = {"status": "processing"}
    
    # Start processing in background
    background_tasks.add_task(generate_transcript_task, task_id, file_path)

    return ProcessingResponse(
        task_id=task_id,
        status="processing",
        message="File uploaded successfully"
    )

@app.post("/generate-analysis", response_model=ProcessingResponse)
async def generate_analysis(background_tasks: BackgroundTasks, file: UploadFile): 
    if not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only .txt files are supported for analysis generation")
    
    task_id = str(uuid.uuid4())
    file_path = Path(f"media_storage/analysis/{task_id}_{file.filename}")
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    active_tasks[task_id] = {"status": "processing"}
    background_tasks.add_task(generate_analysis_task, task_id, file_path)

    return ProcessingResponse(task_id=task_id, status="processing", message="Analysis generation started")

@app.post("/generate-key-images", response_model=ProcessingResponse)
async def generate_key_images(
    background_tasks: BackgroundTasks, 
    file: UploadFile, 
    analysis: Optional[UploadFile] = None
):
    # Check if the file is an MP4 video
    if not file.filename.endswith('.mp4'):
        raise HTTPException(status_code=400, detail="Only MP4 files are supported for keyframe extraction")

    # Generate a unique task ID
    task_id = str(uuid.uuid4())
    
    # Save the MP4 file
    file_path = Path(f"media_storage/temp/{task_id}_{file.filename}")
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save video file: {str(e)}")

    # If an analysis JSON file is provided, save it as well
    analysis_path = None
    if analysis:
        if not analysis.filename.endswith('.json'):
            raise HTTPException(status_code=400, detail="Only .json files are supported for analysis")
        
        analysis_path = Path(f"media_storage/analysis/{task_id}_{analysis.filename}")
        analysis_path.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            with analysis_path.open("wb") as buffer:
                shutil.copyfileobj(analysis.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save analysis file: {str(e)}")

    # Initialize task status
    active_tasks[task_id] = {"status": "processing"}

    # Start the background task
    background_tasks.add_task(get_images_task, task_id, file_path, analysis_path)

    return ProcessingResponse(
        task_id=task_id,
        status="processing",
        message="Keyframe extraction started"
    )

@app.post("/upload", response_model=ProcessingResponse)
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile
):
    if not file.filename.endswith('.mp4'):
        raise HTTPException(status_code=400, detail="Only MP4 files are supported")

    # Create unique task ID
    task_id = str(uuid.uuid4())
    
    # Save uploaded file
    file_path = Path(f"media_storage/temp/{task_id}_{file.filename}")
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Initialize task status
    active_tasks[task_id] = {"status": "processing"}
    
    # Start processing in background
    background_tasks.add_task(process_video_task, task_id, file_path)

    return ProcessingResponse(
        task_id=task_id,
        status="processing",
        message="Video upload successful. Processing started."
    )

@app.get("/status/{task_id}", response_model=ProcessingResponse)
async def get_status(task_id: str):
    if task_id not in active_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = active_tasks[task_id]
    status = task_info["status"]
    
    message = "Processing in progress"
    if status == "completed":
        message = "Processing completed successfully"
    elif status == "failed":
        message = f"Processing failed: {task_info.get('error', 'Unknown error')}"
    
    return ProcessingResponse(
        task_id=task_id,
        status=status,
        message=message
    )

@app.get("/result/{task_id}")
async def get_result(task_id: str):
    if task_id not in active_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = active_tasks[task_id]
    if task_info["status"] != "completed":
        raise HTTPException(
            status_code=400, 
            detail=f"Task is not completed. Current status: {task_info['status']}"
        )
    
    return JSONResponse(content=task_info["result"])

@app.get("/analysis/{task_id}")
async def get_analysis(task_id: str):
    if task_id not in active_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = active_tasks[task_id]
    if task_info["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Task is not completed. Current status: {task_info['status']}"
        )
    
    analysis_path = Path(task_info["result"]["analysis"]) / f"ai_lecture_analysis.json"
    if not analysis_path.exists():
        raise HTTPException(status_code=404, detail="Analysis file not found")
    
    return FileResponse(analysis_path)

@app.get("/keyframe/{task_id}/{frame_number}")
async def get_keyframe(task_id: str, frame_number: int):
    if task_id not in active_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = active_tasks[task_id]
    if task_info["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Task is not completed. Current status: {task_info['status']}"
        )
    
    keyframes_dir = Path(task_info["result"]["keyframes_dir"])
    frames = list(keyframes_dir.glob("frame_*.jpg"))
    
    if not frames or frame_number >= len(frames):
        raise HTTPException(status_code=404, detail="Keyframe not found")
    
    return FileResponse(frames[frame_number])

@app.get("/transcript/{task_id}")
async def get_transcript(task_id: str):
    if task_id not in active_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = active_tasks[task_id]
    if task_info["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Task is not completed. Current status: {task_info['status']}"
        )
    
    transcript_path = Path(task_info["result"]["transcript_path"])
    if not transcript_path.exists():
        raise HTTPException(status_code=404, detail="Transcript file not found")
    
    return FileResponse(transcript_path)

@app.post("/get-prep-assistance", response_model=ProcessingResponse)
async def get_prep_assistance(
    background_tasks: BackgroundTasks,
    request: ExamPrepRequest  # Updated to use the new request model
):
    task_id = str(uuid.uuid4())
    active_tasks[task_id] = {"status": "processing"}

    async def generate_assistance_task(task_id: str, request: ExamPrepRequest):
        try:
            # Generate study guide using ExamPrepAssistant
            study_guide = await prep_assistant.generate_study_guide(
                course_materials=[{
                    "filename": m.filename,
                    "type": m.type,
                    "description": m.description,
                    "date_added": m.date_added,
                    "topics": m.topics,
                    # "difficulty": m.difficulty
                } for m in request.course_materials],
                syllabus={
                    "course_name": request.syllabus.course_name,
                    "exam_type": request.syllabus.exam_type,
                    "exam_date": request.syllabus.exam_date,
                    "current_date": str(datetime.now().date()),
                    "duration": request.syllabus.duration,
                    "format": request.syllabus.format,
                    "modules": {
                        name: {
                            "weight": module.weight,
                            "objectives": module.objectives
                        } for name, module in request.syllabus.modules.items()
                    }
                }
            )
            
            active_tasks[task_id] = {
                "status": "completed",
                "result": study_guide
            }
        except Exception as e:
            active_tasks[task_id] = {
                "status": "failed",
                "error": str(e)
            }
    
    background_tasks.add_task(generate_assistance_task, task_id, request)
    
    return ProcessingResponse(
        task_id=task_id,
        status="processing",
        message="Study guide generation in progress"
    )

@app.get("/assistance-result/{task_id}")
async def get_assistance_result(task_id: str):
    if task_id not in active_tasks:
        raise HTTPException(
            status_code=404, 
            detail="Task not found"
        )
    
    task_info = active_tasks[task_id]
    
    if task_info["status"] == "failed":
        raise HTTPException(
            status_code=500,
            detail=f"Task failed: {task_info.get('error', 'Unknown error')}"
        )
    
    if task_info["status"] != "completed":
        raise HTTPException(
            status_code=202, 
            detail={
                "status": task_info["status"],
                "message": "Task is still processing"
            }
        )
    
    return JSONResponse(content=task_info["result"])

class QuizRequest(BaseModel):
    subject: str
    topic: Optional[str] = None

class QuizResponse(BaseModel):
    task_id: str
    status: str
    message: str

class QuizResult(BaseModel):
    quiz_id: str
    score: float
    total_marks: float
    percentage: float
    updated_ability: float
    updated_level: str

class ResponseSubmitRequest(BaseModel):
    quiz_id: str
    responses: Dict[str, str]

syllabus = StaticSyllabus()
quiz_generator = AISyllabusQuizGenerator(syllabus)

@app.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz_endpoint(
    background_tasks: BackgroundTasks,
    request: QuizRequest
):
    """Generate a quiz and return a task ID for tracking."""
    task_id = str(uuid.uuid4())
    active_tasks[task_id] = {"status": "processing"}

    async def generate_quiz_task(task_id: str, subject: str, topic: Optional[str]):
        try:
            quiz = await quiz_generator.generate_quiz(subject, topic)
            active_tasks[task_id] = {
                "status": "completed",
                "result": quiz
            }
        except Exception as e:
            active_tasks[task_id] = {
                "status": "failed",
                "error": str(e)
            }

    background_tasks.add_task(generate_quiz_task, task_id, request.subject, request.topic)
    
    return QuizResponse(
        task_id=task_id,
        status="processing",
        message="Quiz generation in progress"
    )

@app.get("/quiz-result/{task_id}")
async def get_quiz_result(task_id: str):
    """Retrieve the result of a quiz generation task."""
    if task_id not in active_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = active_tasks[task_id]
    
    if task_info["status"] == "failed":
        raise HTTPException(
            status_code=500,
            detail=f"Task failed: {task_info.get('error', 'Unknown error')}"
        )
    
    if task_info["status"] != "completed":
        raise HTTPException(
            status_code=202,
            detail={"status": task_info["status"], "message": "Task is still processing"}
        )
    
    return JSONResponse(content=task_info["result"])

@app.post("/submit-quiz", response_model=QuizResponse)
async def submit_quiz_endpoint(
    background_tasks: BackgroundTasks,
    request: ResponseSubmitRequest
):
    """Submit quiz responses for evaluation."""
    task_id = str(uuid.uuid4())
    active_tasks[task_id] = {"status": "processing"}

    async def evaluate_quiz_task(task_id: str, quiz_id: str, responses: Dict[str, str]):
        try:
            result = await quiz_generator.evaluate_quiz(quiz_id, responses)
            active_tasks[task_id] = {
                "status": "completed",
                "result": result
            }
        except Exception as e:
            active_tasks[task_id] = {
                "status": "failed",
                "error": str(e)
            }

    background_tasks.add_task(evaluate_quiz_task, task_id, request.quiz_id, request.responses)
    
    return QuizResponse(
        task_id=task_id,
        status="processing",
        message="Quiz evaluation in progress"
    )

@app.get("/evaluation-result/{task_id}", response_model=QuizResult)
async def get_evaluation_result(task_id: str):
    """Retrieve the result of a quiz evaluation."""
    if task_id not in active_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = active_tasks[task_id]
    
    if task_info["status"] == "failed":
        raise HTTPException(
            status_code=500,
            detail=f"Task failed: {task_info.get('error', 'Unknown error')}"
        )
    
    if task_info["status"] != "completed":
        raise HTTPException(
            status_code=202,
            detail={"status": task_info["status"], "message": "Task is still processing"}
        )
    
    return QuizResult(**task_info["result"])

@app.get("/student-history")
async def get_student_history():
    """Retrieve the student's quiz history."""
    history = quiz_generator.student.get_quiz_history()
    return JSONResponse(content=history)

class ResponseSubmitRequest(BaseModel):
    quiz_id: str
    responses: Dict[str, str]

class StudentAbility(BaseModel):
    ability: float
    level: str

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

class RoutineResult(BaseModel):
    morning_routine: str
    study_plan: Dict[str, str]  # Subject -> Schedule
    exercise: str
    evening_routine: str
    productivity_tips: str

@app.get("/subjects")
async def get_subjects():
    """Retrieve a list of all available subjects."""
    subjects = quiz_generator.syllabus.get_subjects()
    return JSONResponse(content={"subjects": subjects})

@app.get("/student-ability", response_model=StudentAbility)
async def get_student_ability():
    """Retrieve the student's current ability and level."""
    ability = quiz_generator.student.get_ability()
    level = quiz_generator.student.get_level()
    return StudentAbility(ability=ability, level=level)

@app.post("/generate-routine", response_model=RoutineResponse)
async def generate_routine_endpoint(
    background_tasks: BackgroundTasks,
    request: RoutineRequest
):
    """Generate a routine and return a task ID for tracking."""
    task_id = str(uuid.uuid4())
    active_tasks[task_id] = {"status": "processing"}

    async def generate_routine_task(task_id: str, request: RoutineRequest):
        try:
            routine = await routine_generator.generate_routine(request)
            active_tasks[task_id] = {
                "status": "completed",
                "result": routine
            }
        except Exception as e:
            active_tasks[task_id] = {
                "status": "failed",
                "error": str(e)
            }

    background_tasks.add_task(generate_routine_task, task_id, request)
    
    return RoutineResponse(
        task_id=task_id,
        status="processing",
        message="Routine generation in progress"
    )

@app.get("/routine-result/{task_id}", response_model=RoutineResult)
async def get_routine_result(task_id: str):
    """Retrieve the result of a routine generation task."""
    if task_id not in active_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = active_tasks[task_id]
    
    if task_info["status"] == "failed":
        raise HTTPException(
            status_code=500,
            detail=f"Task failed: {task_info.get('error', 'Unknown error')}"
        )
    
    if task_info["status"] != "completed":
        raise HTTPException(
            status_code=202,
            detail={"status": task_info["status"], "message": "Task is still processing"}
        )
    
    return RoutineResult(**task_info["result"])

@app.get("/student-history")
async def get_student_history():
    """Retrieve student's quiz history from StudentIRT."""
    history = student_irt.get_quiz_history()
    return JSONResponse(content=history)

@app.get("/student-ability")
async def get_student_ability():
    """Retrieve student's current ability from StudentIRT."""
    return JSONResponse(content={
        "ability": student_irt.get_ability(),
        "level": student_irt.get_level()
    })
# @app.get("/routine/{task_id}", response_model=ProcessingResponse)
# async def get_routine(task_id: str):
#     if task_id not in active_tasks:
#         raise Excep

@app.delete("/cleanup-task/{task_id}")
async def cleanup_task(task_id: str):
    if task_id in active_tasks:
        del active_tasks[task_id]
        return {"message": f"Task {task_id} cleaned up successfully"}
    raise HTTPException(status_code=404, detail="Task not found")

<<<<<<< HEAD

# debate route

=======
>>>>>>> 2e67738e33ec8c846692d66f940bbaa3ee03478c
class DebateRequest(BaseModel):
    topic: str
    stance: str
    cards: List[str]
    user_input: Optional[str] = None  # Optional for ongoing turns
    action: Optional[str] = None  # "start", "continue", or "end"

class DebateResponse(BaseModel):
    ai_response: Optional[str] = None
    review: Optional[str] = None
    scorecard: Optional[Dict] = None
    suggestions: Optional[List[str]] = None

@app.post("/debate")
def handle_debate(request: DebateRequest) -> DebateResponse:
    if not request.topic or not request.stance or not request.cards:
        raise HTTPException(status_code=400, detail="Missing required fields")
<<<<<<< HEAD

    # Load existing debate history from Supabase (simplified; implement based on debate ID)
    debate_id = "example-debate-id"  # Replace with actual ID from frontend or database
    debate_history = []  # Fetch from Supabase or pass in request if stored client-side

    debate = Debate(topic=request.topic, stance=request.stance, cards=request.cards, debate_history=debate_history)

    if request.action == "end":
        result = debate.end_debate()
        return DebateResponse(
            review=result["review"],
            scorecard=result["scorecard"],
            suggestions=result["suggestions"]
        )
    else:
        ai_response = debate.run_debate(request.user_input)
        return DebateResponse(ai_response=ai_response)
    
# micro goals


class MicroGoalRequest(BaseModel):
    learning_objective: str
    interests: List[str] = None
    engagement_data: List[Dict] = None

class MicroGoalResponse(BaseModel):
    micro_goals: List[Dict]
    suggestions: List[str]
    progress: float

@app.post("/micro-goals")
def get_micro_goals(request: MicroGoalRequest) -> MicroGoalResponse:
    optimizer = MicroGoalOptimizer(
        request.learning_objective,
        request.interests or ["coding"],  # Default to 'coding' for your use case
        request.engagement_data or []
    )
    result = optimizer.generate_micro_goals()
    return MicroGoalResponse(**result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
=======
    debate = Debate(topic=request.topic, stance=request.stance, cards=request.cards)
    ai_response = debate.run_debate()
    return {"ai_response": ai_response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
>>>>>>> 2e67738e33ec8c846692d66f940bbaa3ee03478c
