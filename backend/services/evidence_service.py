import hashlib
import os
from pathlib import Path
from typing import Any, Dict


def metadata(path: str, original_name: str) -> Dict[str, Any]:
    file_path = Path(path)
    extension = file_path.suffix.lower()
    result: Dict[str, Any] = {
        "filename": original_name,
        "file_size": file_path.stat().st_size,
        "file_type": extension.lstrip(".") or "unknown",
        "sha256": hashlib.sha256(file_path.read_bytes()).hexdigest(),
    }
    if extension in {".jpg", ".jpeg", ".png"}:
        try:
            from PIL import Image
            with Image.open(file_path) as image:
                result["width"], result["height"] = image.size
        except Exception:
            result["width"] = result["height"] = None
    elif extension == ".pdf":
        try:
            from PyPDF2 import PdfReader
            result["pages"] = len(PdfReader(str(file_path)).pages)
        except Exception:
            result["pages"] = None
    return result


def is_allowed(filename: str) -> bool:
    return os.path.splitext(filename)[1].lower() in {".jpg", ".jpeg", ".png", ".pdf", ".txt"}