import os

import httpx


def get_dbapi_client() -> httpx.Client:
    base_url = os.environ.get("DATABUTTON_API_URL", "")
    return httpx.Client(base_url=base_url)
