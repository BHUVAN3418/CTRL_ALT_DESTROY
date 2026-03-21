"""
RainGuard AI — FastAPI Backend Entry Point
Phase 1: Seed — Basic structure, health endpoint, and data model definitions
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from routers import workers, policies, claims, triggers

app = FastAPI(
    title="RainGuard AI API",
    description="Parametric Income Insurance for Food Delivery Workers",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS — allow React frontend (localhost:3000 dev, Render.com prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://rainguard-ai.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(workers.router, prefix="/api/workers", tags=["Workers"])
app.include_router(policies.router, prefix="/api/policies", tags=["Policies"])
app.include_router(claims.router, prefix="/api/claims", tags=["Claims"])
app.include_router(triggers.router, prefix="/api/triggers", tags=["Triggers"])


@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check endpoint — required for Phase 1."""
    return {
        "status": "healthy",
        "service": "RainGuard AI API",
        "version": "0.1.0",
        "timestamp": datetime.utcnow().isoformat(),
        "phase": "Seed (Phase 1)"
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to RainGuard AI 🌧️",
        "tagline": "When rain stops work, RainGuard pays automatically.",
        "docs": "/docs"
    }
