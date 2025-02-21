import os
import json
import asyncio
from pathlib import Path
import subprocess
import whisper
from typing import Dict, Tuple, Any, Union
import torch
import sys
import tqdm
import time
import ffmpeg
import re
import datetime
import google.generativeai as genai

# Configure Gemini API and initialize the model
genai.configure(api_key="AIzaSyAK0XnqsxKZnyJM7oLi3ndeYeO_Gz8WiC8")
model = genai.GenerativeModel('gemini-2.0-flash')

# Define the schema for analysis data validation
ANALYSIS_SCHEMA = {
    "required": ["title", "summary", "key_points", "topics", "key_moments"],
    "properties": {
        "duration": {"pattern": "^([0-9]{2}):([0-9]{2}):([0-9]{2})$"},
        "key_moments": {
            "type": "array",
            "items": {
                "properties": {
                    "timestamp": {"pattern": "^([0-9]{2}):([0-9]{2}):([0-9]{2})$"}
                }
            }
        }
    }
}

def parse_ai_output(text: str, schema: Dict[str, Any] = None) -> Union[Dict, list]:
    """
    Parse AI output into JSON format with schema validation.
    
    Args:
        text (str): Raw text output from AI model
        schema (Dict): Optional JSON schema for validation
        
    Returns:
        Union[Dict, list]: Parsed and validated JSON data
        
    Raises:
        ValueError: If JSON is invalid or schema validation fails
    """
    def validate_timestamp(timestamp: str) -> bool:
        """Validate HH:MM:SS timestamp format."""
        try:
            datetime.datetime.strptime(timestamp, '%H:%M:%S')
            return True
        except ValueError:
            return False

    def validate_data(data: Union[Dict, list], schema: Dict[str, Any]) -> None:
        """Validate data against schema requirements."""
        if not schema:
            return

        if isinstance(data, dict):
            # Check required fields
            required_fields = schema.get("required", [])
            for field in required_fields:
                if field not in data:
                    raise ValueError(f"Missing required field: {field}")

            # Validate field types and formats
            properties = schema.get("properties", {})
            for field, value in data.items():
                if field in properties:
                    field_schema = properties[field]
                    
                    # Validate arrays
                    if field_schema.get("type") == "array":
                        if not isinstance(value, list):
                            raise ValueError(f"Field {field} must be an array")
                        # Optionally add more array item validation here
                    
                    # Validate timestamps
                    if "pattern" in field_schema and field_schema["pattern"].startswith("^([0-9]{2}):([0-9]{2}):([0-9]{2})$"):
                        if not validate_timestamp(value):
                            raise ValueError(f"Invalid timestamp format in {field}: {value}")
                            
                    # Validate key_moments timestamps
                    if field == "key_moments" and isinstance(value, list):
                        for moment in value:
                            if "timestamp" in moment:
                                if not validate_timestamp(moment["timestamp"]):
                                    raise ValueError(f"Invalid timestamp in key_moments: {moment['timestamp']}")

    try:
        # Remove code block markers if present
        cleaned_text = re.sub(r'```(?:json)?\s*|\s*```', '', text.strip())
        cleaned_text = cleaned_text.strip()
        
        # Parse the JSON string
        parsed_data = json.loads(cleaned_text)
        
        # Validate against schema if provided
        validate_data(parsed_data, schema)
        
        return parsed_data
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error parsing data: {str(e)}")

class MediaProcessor:
    def __init__(self, base_dir: str = "media_processing"):
        """Initialize the MediaProcessor with necessary directories."""
        self.base_dir = Path(base_dir)
        self.temp_dir = self.base_dir / "temp"
        self.transcription_dir = self.base_dir / "transcriptions"
        self.keyframes_dir = self.base_dir / "keyframes"
        self.analysis_dir = self.base_dir / "analysis"
        
        # Create all necessary directories
        for dir_path in [self.temp_dir, self.transcription_dir, self.keyframes_dir, self.analysis_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize Whisper model with GPU support
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading Whisper model on {self.device}...", end='', flush=True)
        self.whisper_model = whisper.load_model("base").to(self.device)
        print(" Done!")

    @staticmethod
    def print_with_flush(text: str):
        """Print text with immediate flush."""
        print(text, end='', flush=True)
        sys.stdout.flush()

    async def extract_audio(self, mp4_path: str | Path) -> Path:
        """Extract audio from MP4 and convert to WAV format."""
        self.mp4_path = Path(mp4_path)
        if not self.mp4_path.exists():
            raise FileNotFoundError(f"Video file not found: {mp4_path}")
            
        wav_path = self.temp_dir / f"{self.mp4_path.stem}.wav"
        
        self.print_with_flush("Extracting audio...")
        (
            ffmpeg
            .input(str(self.mp4_path))
            .output(str(wav_path), 
                    **{
                        'b:a': '64k',
                        'ar': 16000,
                        'ac': 1,
                        'vn': None,
                        'filter:a': 'volume=2.0'
                    })
            .run()
        )
        self.print_with_flush(" Done!\n")
        return wav_path

    async def transcribe_audio(self, wav_path: Path) -> Tuple[Path, Dict[str, Any]]:
        """Transcribe WAV file using Whisper with progress tracking."""
        if not wav_path.exists():
            raise FileNotFoundError(f"WAV file not found: {wav_path}")
        
        transcript_path = self.transcription_dir / f"{wav_path.stem}_transcript.txt"
        
        try:
            self.print_with_flush("Starting transcription...\n")
            
            with tqdm.tqdm(total=100, desc="Processing audio") as pbar:
                result = await asyncio.to_thread(
                    self.whisper_model.transcribe,
                    str(wav_path),
                    language="en",
                    fp16=self.device == "cuda",
                    verbose=False
                )
                pbar.update(100)
            
            segments = result["segments"]
            
            async with asyncio.Lock():
                with open(transcript_path, 'w', encoding='utf-8') as f:
                    total_duration = segments[-1]['end'] if segments else 0
                    
                    with tqdm.tqdm(total=100, desc="Transcribing", position=0, leave=True) as pbar:
                        for segment in segments:
                            progress = (segment['end'] / total_duration) * 100
                            pbar.update(int(progress - pbar.n))
                            
                            timestamp = f"[{segment['start']:.2f}s -> {segment['end']:.2f}s]"
                            text = f"{timestamp} {segment['text'].strip()}"
                            f.write(text + '\n')
                            self.print_with_flush(f"\r{text}\n")
                            await asyncio.sleep(0.1)
            
            self.print_with_flush("\nTranscription completed!\n")
            return transcript_path, result
            
        except Exception as e:
            raise RuntimeError(f"Transcription failed: {str(e)}")
        
    async def save_analysis(self, analysis: Dict[str, Any], base_name: str) -> Path:
        """Save analysis results to a JSON file."""
        self.analysis_dir.mkdir(exist_ok=True)
        
        analysis_path = self.analysis_dir / f"{base_name}_analysis.json"
        async with asyncio.Lock():
            with open(analysis_path, 'w', encoding='utf-8') as f:
                json.dump(analysis, f, indent=4)
        return analysis_path
        
    async def analyze_transcript(self, transcript_path: Path) -> Dict[str, Any]:
        """Analyze transcript using Google's Gemini model."""
        if not transcript_path.exists():
            raise FileNotFoundError(f"Transcript file not found: {transcript_path}")
            
        try:
            self.print_with_flush("Analyzing transcript...")
            with open(transcript_path, 'r', encoding='utf-8') as f:
                transcript_text = f.read()

            prompt = f"""
            Analyze the following transcript and provide:
            1. A concise summary
            2. Key points discussed
            3. Main topics covered
            4. Most important moments with their approximate timestamps (format: <number>s)
            
            Transcript:
            {transcript_text}

            Respond in the following JSON format:
            {{
                "title": "string",
                "duration": "string",
                "summary": "string",
                "key_points": ["point1", "point2", ...],
                "topics": ["topic1", "topic2", ...],
                "key_moments": [
                    {{"timestamp": "HH:MM:SS", "description": "string"}}
                ]
            }}
            """

            response = await asyncio.to_thread(
                model.generate_content,
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            
            # Parse and validate the response using parse_ai_output
            try:
                analysis_data = parse_ai_output(response.text, ANALYSIS_SCHEMA)
            except ValueError as e:
                print(f"Warning: Invalid analysis data - {str(e)}")
                analysis_data = {
                    "summary": response.text,
                    "key_points": [],
                    "topics": [],
                    "key_moments": []
                }
            
            await self.save_analysis(analysis=analysis_data, base_name='ai_lecture')
            self.print_with_flush(" Done!\n")
            print(analysis_data)
            return analysis_data
        except Exception as e:
            raise RuntimeError(f"Transcript analysis failed: {str(e)}")

    async def extract_keyframes(self, mp4_path: Path, key_moments: list = None, analysis_path: Path=None) -> Path:
        """Extract images from key moments in the MP4 file."""
        if not mp4_path.exists():
            raise FileNotFoundError(f"Video file not found: {mp4_path}")
        
        if key_moments is None:
            if analysis_path is None or not analysis_path.exists():
                raise ValueError("Either key_moments or a valid analysis_path must be provided")
            
            with analysis_path.open("r") as file:
                analysis_data = json.load(file)
                key_moments = analysis_data.get("key_moments", [])

        if not key_moments:
            raise ValueError("No key moments provided in either argument or analysis file")
        
        base_name = mp4_path.stem
        keyframes_subdir = self.keyframes_dir / base_name
        keyframes_subdir.mkdir(parents=True, exist_ok=True)
        
        for idx, moment in enumerate(key_moments):
            timestamp = moment.get('timestamp', '00:00:00')
            description = ''.join(c for c in moment.get('description', '')[:30] 
                                if c.isalnum() or c in (' ', '_', '-')).strip()
            output_path = keyframes_subdir / f"frame_{idx:03d}_{timestamp}_{description}.jpg"
            
            try:
                stream = ffmpeg.input(str(mp4_path), ss=timestamp)
                stream = ffmpeg.output(stream, str(output_path), 
                                     vframes=1, 
                                     **{'q:v': 2})
                ffmpeg.run(stream, capture_stdout=True, capture_stderr=True)
            except ffmpeg.Error as e:
                print(f"Warning: Failed to extract frame at {timestamp}: {str(e)}")
                continue
        
        return keyframes_subdir
    
    async def process_media(self, mp4_path: str | Path) -> Dict[str, Any]:
        """Main async processing pipeline."""
        try:
            wav_path = await self.extract_audio(mp4_path)
            transcript_path, transcript_result = await self.transcribe_audio(wav_path)
            analysis = await self.analyze_transcript(transcript_path)
            keyframes_dir = await self.extract_keyframes(self.mp4_path, analysis.get('key_moments', []))
            
            try:
                if wav_path.exists():
                    wav_path.unlink()
            except Exception as e:
                print(f"Warning: Failed to cleanup temporary file {wav_path}: {str(e)}")
            
            return {
                'transcript_path': str(transcript_path),
                'analysis': analysis,
                'keyframes_dir': str(keyframes_dir)
            }
            
        except Exception as e:
            try:
                if 'wav_path' in locals() and wav_path.exists():
                    wav_path.unlink()
            except Exception:
                pass
            raise RuntimeError(f"Media processing failed: {str(e)}")

    async def generate_transcript(self, mp4_path: str | Path) -> Dict[str, Any]:
        try:
            wav_path = await self.extract_audio(mp4_path)
            transcript_path, transcript_result = await self.transcribe_audio(wav_path)

            try:
                if wav_path.exists():
                    wav_path.unlink()
            except Exception as e:
                print(f"Warning: Failed to cleanup temporary file {wav_path}: {str(e)}")

            return {'transcript_path': str(transcript_path), 'transcript': transcript_result}
        except Exception as e:
            try:
                if 'wav_path' in locals() and wav_path.exists():
                    wav_path.unlink()
            except Exception:
                pass
            raise RuntimeError(f"Media processing failed: {str(e)}")

async def main():
    try:
        start_time = time.time()
        processor = MediaProcessor()
        result = await processor.process_media("../ai.mp4")
        elapsed_time = time.time() - start_time
        
        print(f"\nProcessing completed in {elapsed_time:.2f} seconds")
        print(f"Transcript saved at: {result['transcript_path']}")
        print(f"Keyframes saved in: {result['keyframes_dir']}")
        print(f"Analysis: {result['analysis']}")
    except Exception as e:
        print(f"Error: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main())