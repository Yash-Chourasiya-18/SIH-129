"""
MahaSetu Backend — FastAPI Application Entry Point
Secure Government Digital Interoperability & Service Orchestration Platform
SIH 2026 | Problem Statement #129 | Government of Maharashtra
"""
import sys
import os

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.database import init_db
from app.routers import auth, mock_apis, services, officer, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize DB tables & seed demo data
    await init_db()
    try:
        from seed_data import seed
        await seed()
    except Exception as e:
        print(f"Startup seed notice: {e}")
    yield
    # Shutdown: nothing to clean up for SQLite


app = FastAPI(
    title="MahaSetu API",
    description=(
        "Secure Government Digital Interoperability & Service Orchestration Platform. "
        "SIH 2026 | Problem Statement #129 | Government of Maharashtra. "
        "**PROTOTYPE — Uses synthetic data only. Not connected to real government systems.**"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(mock_apis.router)
app.include_router(services.router)
app.include_router(officer.router)
app.include_router(admin.router)


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}


# Serve Frontend dist files if available (Single-Server Deployment)
frontend_dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist_path):
    assets_dir = os.path.join(frontend_dist_path, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react_app(full_path: str):
        # Ignore API and docs routes
        if full_path.startswith("api/") or full_path == "docs" or full_path == "redoc" or full_path == "openapi.json":
            return None
        file_path = os.path.join(frontend_dist_path, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist_path, "index.html"))

