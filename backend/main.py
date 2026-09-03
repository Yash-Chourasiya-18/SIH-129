"""
MahaSetu Backend — FastAPI Application Entry Point
Secure Government Digital Interoperability & Service Orchestration Platform
SIH 2026 | Problem Statement #129 | Government of Maharashtra
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.routers import auth, mock_apis, services, officer, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize DB tables
    await init_db()
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
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
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


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "MahaSetu",
        "version": "1.0.0",
        "status": "operational",
        "tagline": "Secure Government Digital Interoperability & Service Orchestration Platform",
        "disclaimer": "PROTOTYPE — Synthetic data only. Not connected to real government systems.",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
