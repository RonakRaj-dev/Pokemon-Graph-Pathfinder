"""
Pokémon Pathfinder — FastAPI Application Entry Point.

Builds the weighted grid on startup from the two JSON data sources
and registers all API routers under /api/v1/.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import pathfinder as pathfinder_router
from app.api.v1 import region as region_router
from app.core.graph import build_grid

logger = logging.getLogger("pokemon-pathfinder")

# ─── Paths to data files ─────────────────────────────────────────────────────

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
DATA_DIR = BASE_DIR / "jsonFile"
MAP_JSON = DATA_DIR / "map.json"
ANNOTATIONS_JSON = DATA_DIR / "_annotations.coco.json"


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Build the weighted grid once at startup and inject it into routers."""
    logger.info("Building weighted grid from %s + %s …", MAP_JSON, ANNOTATIONS_JSON)
    grid = build_grid(MAP_JSON, ANNOTATIONS_JSON)
    logger.info(
        "Grid ready: %d×%d, %d cities, %d Pokémon spawns, %d landmarks",
        grid.cols,
        grid.rows,
        len(grid.cities),
        len(grid.pokemon_spawns),
        len(grid.landmarks),
    )

    # Inject the grid into the router modules
    pathfinder_router.set_grid(grid)
    region_router.set_grid(grid)

    yield  # Application runs

    logger.info("Shutting down Pokémon Pathfinder")


# ─── App creation ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="Pokémon Pathfinder API",
    description=(
        "Find optimal paths across the Kanto region using multiple "
        "pathfinding algorithms. Merges a 28×20 tilemap with Roboflow "
        "object-detection annotations to create a weighted grid."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS (allow Next.js frontend) ───────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",  # Allow all during development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register routers ────────────────────────────────────────────────────────

app.include_router(pathfinder_router.router, prefix="/api/v1")
app.include_router(region_router.router, prefix="/api/v1")


# ─── Root endpoint ────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "Pokémon Pathfinder API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "find_path": "POST /api/v1/find-path",
            "compare": "POST /api/v1/compare-algorithms",
            "grid": "GET /api/v1/grid",
            "cell": "GET /api/v1/grid/cell/{x}/{y}",
            "mst": "GET /api/v1/mst",
            "cities": "GET /api/v1/cities",
            "pokemon_spawns": "GET /api/v1/pokemon-spawns",
            "landmarks": "GET /api/v1/landmarks",
        },
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
