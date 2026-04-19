import base64
import os
import time

import httpx
from pydantic import BaseModel


def from_b64(name: str, b64: str) -> str:
    try:
        value_bytes = base64.urlsafe_b64decode(b64.encode("utf-8"))
    except Exception:
        print(f"Error(1) decoding value of secret {name}, try adding it again")
        return ""
    try:
        value_str = value_bytes.decode("utf-8")
    except UnicodeDecodeError:
        print(f"Error(2) decoding value of secret {name}, try adding it again")
        value_str = value_bytes.decode("utf-8", errors="ignore")
    return value_str


def fetch_and_inject_workspace_secrets() -> None:
    """Load secrets from .env file for local/standalone deployment."""
    try:
        import dotenv
        dotenv.load_dotenv(os.environ.get("DOT_ENV_FILE", ".env"))
    except ImportError:
        pass  # dotenv not installed, skip


def fetch_and_inject_secrets() -> None:
    """Load secrets/environment variables.

    For standalone deployment outside of Databutton/Riff infrastructure,
    secrets are loaded from a .env file.
    """
    fetch_and_inject_workspace_secrets()
