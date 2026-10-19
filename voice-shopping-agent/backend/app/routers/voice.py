import logging

import httpx
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/voice", tags=["voice"])
GROQ_TRANSCRIPTION_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
MAX_AUDIO_BYTES = 25 * 1024 * 1024


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    if not settings.groq_api_key:
        raise HTTPException(
            status_code=503,
            detail="Voice transcription is not configured. Set GROQ_API_KEY on the backend.",
        )
    if audio.content_type and not (
        audio.content_type.startswith("audio/") or audio.content_type == "video/webm"
    ):
        raise HTTPException(status_code=415, detail="Upload an audio recording.")

    contents = await audio.read(MAX_AUDIO_BYTES + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="The audio recording is empty.")
    if len(contents) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio recordings must be 25 MB or smaller.")

    filename = audio.filename or "voice-message.webm"
    headers = {"Authorization": f"Bearer {settings.groq_api_key}"}
    files = {
        "file": (
            filename,
            contents,
            audio.content_type or "application/octet-stream",
        )
    }
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                GROQ_TRANSCRIPTION_URL,
                headers=headers,
                data={"model": settings.groq_voice_model},
                files=files,
            )
            response.raise_for_status()
    except httpx.HTTPStatusError as error:
        logger.error(
            "Groq transcription failed with status %s",
            error.response.status_code,
        )
        raise HTTPException(
            status_code=502,
            detail="Voice transcription failed. Please try again.",
        ) from error
    except httpx.RequestError as error:
        logger.error("Could not reach Groq transcription service: %s", error)
        raise HTTPException(
            status_code=502,
            detail="Voice transcription service is unavailable. Please try again.",
        ) from error

    try:
        result = response.json()
        transcript = result.get("text") if isinstance(result, dict) else None
    except ValueError as error:
        logger.error("Groq transcription returned invalid JSON.")
        raise HTTPException(
            status_code=502,
            detail="Voice transcription returned an invalid response.",
        ) from error
    if not isinstance(transcript, str):
        raise HTTPException(
            status_code=502,
            detail="Voice transcription returned no transcript.",
        )
    transcript = transcript.strip()
    if not transcript:
        raise HTTPException(status_code=422, detail="No speech was detected.")
    return {"text": transcript}
