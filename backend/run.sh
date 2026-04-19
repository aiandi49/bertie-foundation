#!/bin/bash
set -e

# Install deps if needed
if [ ! -d ".venv" ]; then
    python -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt --quiet

# Start the server
PORT=${PORT:-8000}
uvicorn main:app --host 0.0.0.0 --port $PORT
