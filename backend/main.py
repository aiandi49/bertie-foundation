import os
import pathlib
import dotenv
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

dotenv.load_dotenv(".env")
environment = os.getenv("ENV", "dev")
dotenv.load_dotenv(f".env.{environment}", override=True)
print(f"Loaded environment: {environment}")


def import_api_routers() -> APIRouter:
    routes = APIRouter(prefix="/api")
    src_path = pathlib.Path(__file__).parent
    apis_path = src_path / "app" / "apis"
    api_names = [
        p.relative_to(apis_path).parent.as_posix()
        for p in apis_path.glob("*/__init__.py")
    ]
    for name in api_names:
        print(f"Importing API: {name}")
        try:
            api_module = __import__("app.apis." + name, fromlist=[name])
            api_router = getattr(api_module, "router", None)
            if isinstance(api_router, APIRouter):
                routes.include_router(api_router)
        except Exception as e:
            print(f"Failed to import {name}: {e}")
            continue
    return routes


def create_app() -> FastAPI:
    app = FastAPI(title="Bertie Foundation API")

    # CORS - allow frontend origins
    allowed_origins = os.environ.get(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://localhost:8080,https://www.bertiefoundation.org,https://bertiefoundation.org,https://bertie-foundation.vercel.app,https://bertie-foundation-production.up.railway.app"
    ).split(",")

    # In production, add your actual domain(s) to ALLOWED_ORIGINS env var
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(import_api_routers())

    for route in app.routes:
        if hasattr(route, "methods"):
            for method in route.methods:
                print(f"{method} {route.path}")

    return app


app = create_app()
