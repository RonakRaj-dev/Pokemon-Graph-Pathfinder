"""
Region API routes — cities, Pokémon spawns, and landmarks.

GET /cities          → list all cities / towns on the map
GET /pokemon-spawns  → list all Pokémon spawn locations
GET /landmarks       → list all named landmarks
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import APIRouter, HTTPException

from app.models.city import CityResponse, LandmarkResponse, PokemonSpawnResponse

if TYPE_CHECKING:
    from app.core.graph import WeightedGrid

router = APIRouter(tags=["Region"])

# Grid reference — set at startup
_grid: WeightedGrid | None = None


def set_grid(grid: "WeightedGrid") -> None:
    global _grid
    _grid = grid


def _get_grid() -> "WeightedGrid":
    if _grid is None:
        raise HTTPException(status_code=503, detail="Grid not initialised yet")
    return _grid


# ─── GET /cities ──────────────────────────────────────────────────────────────

@router.get("/cities", response_model=list[CityResponse])
async def list_cities() -> list[CityResponse]:
    """Return all cities and towns found on the Pokémon map."""
    grid = _get_grid()
    return [
        CityResponse(
            name=c.name,
            grid_x=c.grid_x,
            grid_y=c.grid_y,
            bbox_px=list(c.bbox_px),
        )
        for c in grid.cities
    ]


# ─── GET /pokemon-spawns ─────────────────────────────────────────────────────

@router.get("/pokemon-spawns", response_model=list[PokemonSpawnResponse])
async def list_pokemon_spawns() -> list[PokemonSpawnResponse]:
    """Return all Pokémon spawn points on the map."""
    grid = _get_grid()
    return [
        PokemonSpawnResponse(
            name=p.name,
            grid_x=p.grid_x,
            grid_y=p.grid_y,
        )
        for p in grid.pokemon_spawns
    ]


# ─── GET /landmarks ──────────────────────────────────────────────────────────

@router.get("/landmarks", response_model=list[LandmarkResponse])
async def list_landmarks() -> list[LandmarkResponse]:
    """Return all named landmarks on the map."""
    grid = _get_grid()
    return [
        LandmarkResponse(
            name=lm.name,
            grid_x=lm.grid_x,
            grid_y=lm.grid_y,
        )
        for lm in grid.landmarks
    ]
