import os
import json
import asyncio
from pathlib import Path
import subprocess
import whisper
from ollama import AsyncClient
from typing import Dict, Tuple, Any
import torch
import sys
import tqdm
import time
import ffmpeg

class MediaProcessor:
    def __init__(self, base_dir: str = "media_processing"):
        """Initialize the MediaProcessor with necessary directories."""
        self.base_dir = Path(base_dir)
        self.temp_dir = self.base_dir / "temp"
        self.transcription_dir = self.base_dir / "transcriptions"
        self.keyframes_dir = self.base_dir / "keyframes"
        self.analysis_dir = self.base_dir / "analysis"
        
        # Create all necessary directories
        for dir_path in [self.temp_dir, self.transcription_dir, self.keyframes_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize Whisper model with GPU support
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading Whisper model on {self.device}...", end='', flush=True)
        self.whisper_model = whisper.load_model("base").to(self.device)
        print(" Done!")
        
        # Initialize Ollama AsyncClient
        self.client = AsyncClient()

    @staticmethod
    def print_with_flush(text: str):
        """Print text with immediate flush."""
        print(text, end='', flush=True)
        sys.stdout.flush()

    async def extract_audio(self, mp4_path: str | Path) -> Path:
        """Extract audio from MP4 and convert to WAV format."""
        # rel_path = mp4_path
        self.mp4_path = Path(mp4_path)
        if not self.mp4_path.exists():
            raise FileNotFoundError(f"Video file not found: {mp4_path}")
            
        wav_path = self.temp_dir / f"{self.mp4_path.stem}.wav"
        
        self.print_with_flush("Extracting audio...")

        (
            ffmpeg
            .input(str(self.mp4_path))        # Input video file
            .output(str(wav_path), 
                    **{
                        'b:a': '64k',     # Set audio bitrate to 64K
                        'ar': 16000,      # Set audio sample rate to 16kHz
                        'ac': 1,          # Set audio channels to 1 (mono)
                        'vn': None,       # Ignore video stream
                        'filter:a': 'volume=2.0'  # Increase volume by a factor of 2.0
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
            
            # Create progress bar for initial processing
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
            
            # Write segments with progress tracking
            async with asyncio.Lock():
                with open(transcript_path, 'w', encoding='utf-8') as f:
                    total_duration = segments[-1]['end'] if segments else 0
                    
                    with tqdm.tqdm(total=100, desc="Transcribing", position=0, leave=True) as pbar:
                        for segment in segments:
                            # Calculate and update progress
                            progress = (segment['end'] / total_duration) * 100
                            pbar.update(int(progress - pbar.n))
                            
                            # Format and write segment
                            timestamp = f"[{segment['start']:.2f}s -> {segment['end']:.2f}s]"
                            text = f"{timestamp} {segment['text'].strip()}"
                            f.write(text + '\n')
                            self.print_with_flush(f"\r{text}\n")
                            
                            # Small delay for readable output
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
        """Analyze transcript using Ollama AsyncClient."""
        if not transcript_path.exists():
            raise FileNotFoundError(f"Transcript file not found: {transcript_path}")
            
        try:
            self.print_with_flush("Analyzing transcript...")
            async with asyncio.Lock():
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

            response = await self.client.chat(
                model='llama3.2',
                messages=[{'role': 'user', 'content': prompt}],
                format='json'
            )
            
            try:
                analysis_data = json.loads(response['message']['content'])
            except json.JSONDecodeError:
                analysis_data = {
                    "summary": response['message']['content'],
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
            # Load key moments from the analysis file if provided
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
        
        processes = []
        for idx, moment in enumerate(key_moments):
            timestamp = moment.get('timestamp', '00:00:00')
            # Sanitize description for filename
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
            
            # Cleanup
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
            # Cleanup on failure
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
            # Cleanup on failure
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