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

# @app.get("/routine/{task_id}", response_model=ProcessingResponse)
# async def get_routine(task_id: str):
#     if task_id not in active_tasks:
#         raise Excep

# Optional: Endpoint to clean up completed tasks
@app.delete("/cleanup-task/{task_id}")
async def cleanup_task(task_id: str):
    if task_id in active_tasks:
        del active_tasks[task_id]
        return {"message": f"Task {task_id} cleaned up successfully"}
    raise HTTPException(status_code=404, detail="Task not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# debate route

class DebateRequest(BaseModel):
    topic: str
    stance: str
    cards: list[str]

@app.post("/debate")
def start_debate(request: DebateRequest):
    if not request.topic or not request.stance or not request.cards:
        raise HTTPException(status_code=400, detail="Missing required fields")
    debate = Debate(topic=request.topic, stance=request.stance, cards=request.cards)
    ai_response = debate.run_debate()
    return {"ai_response": ai_response}