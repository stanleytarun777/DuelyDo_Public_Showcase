from fastapi import UploadFile


# Supported file formats by category
TEXT_EXTENSIONS = {".txt", ".md", ".csv", ".json", ".yaml", ".yml"}
DOCX_EXTENSIONS = {".docx"}
PDF_EXTENSIONS = {".pdf"}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

SUPPORTED_EXTENSIONS = TEXT_EXTENSIONS | DOCX_EXTENSIONS | PDF_EXTENSIONS | IMAGE_EXTENSIONS


async def extract_upload_payload(file: UploadFile, max_bytes: int) -> dict:
    """
    Reads and extracts text content from an uploaded file.

    Supported formats:
    - Plain text (.txt, .md, .csv, .json, .yaml, .yml) — direct UTF-8 decode
    - Word documents (.docx) — paragraph extraction via python-docx
    - PDF files (.pdf) — page text extraction via pypdf
    - Images (.png, .jpg, .jpeg, .webp) — placeholder returned (no OCR in this version)

    Args:
        file: FastAPI UploadFile object
        max_bytes: Maximum allowed file size in bytes (enforced before reading)

    Returns:
        {"name": filename, "content": extracted_text}

    Raises:
        HTTPException 400 for unsupported file types or files exceeding max_bytes
    """
    ...
