from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from App.config import get_settings
from App.models import ExtractResponse, HealthResponse
from App.services.anthropic_service import AnthropicExtractionService
from App.services.file_parser import extract_upload_payload

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(model=settings.anthropic_model)


@app.post("/api/extract", response_model=ExtractResponse)
async def extract_tasks(files: list[UploadFile] = File(...)) -> ExtractResponse:
    parsed_files = [
        await extract_upload_payload(file, settings.max_file_bytes) for file in files
    ]
    service = AnthropicExtractionService(settings)
    tasks = service.extract_tasks(parsed_files)
    return ExtractResponse(tasks=tasks)
