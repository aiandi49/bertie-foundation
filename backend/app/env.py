"""Usage:

from app.env import Mode, mode

if mode == Mode.PROD:
    print("Running in deployed service")
else:
    print("Running in development workspace")
"""

import os
from enum import Enum


class Mode(str, Enum):
    DEV = "development"
    PROD = "production"


# Default to PROD for standalone deployment; override with ENVIRONMENT=development for local dev
mode = Mode.DEV if os.environ.get("ENVIRONMENT", "production") == "development" else Mode.PROD

__all__ = [
    "Mode",
    "mode",
]
