"""
Seed data utilities — load and cache the grid for use outside of FastAPI.

This module is kept for potential CLI or testing use. The main FastAPI app
uses its own lifespan-based grid initialization.
"""

from __future__ import annotations

from pathlib import Path

from app.core.graph import WeightedGrid, build_grid

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend/
DATA_DIR = BASE_DIR / "jsonFile"
MAP_JSON = DATA_DIR / "map.json"
ANNOTATIONS_JSON = DATA_DIR / "_annotations.coco.json"

_cached_grid: WeightedGrid | None = None


def get_grid() -> WeightedGrid:
    """Return the cached grid, building it on first call."""
    global _cached_grid
    if _cached_grid is None:
        _cached_grid = build_grid(MAP_JSON, ANNOTATIONS_JSON)
    return _cached_grid
