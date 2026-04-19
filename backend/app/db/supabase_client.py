import os
from typing import Optional

_supabase = None


def get_supabase():
    global _supabase
    if _supabase is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY are not configured. "
                "Add them to your .env file to enable database storage."
            )
        from supabase import create_client
        _supabase = create_client(url, key)
    return _supabase


def supabase_available() -> bool:
    """Check if Supabase is configured without raising."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")
    return bool(url and key)
