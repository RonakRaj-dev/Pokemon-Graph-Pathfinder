"""
Pydantic models for city / location data returned by the region endpoints.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class CityResponse(BaseModel):
    """A single city / town / island."""
    name: str
    grid_x: int
    grid_y: int
    bbox_px: list[float] = Field(description="[x, y, w, h] in pixel coordinates")


class PokemonSpawnResponse(BaseModel):
    """A single Pokémon spawn point."""
    name: str
    grid_x: int
    grid_y: int


class LandmarkResponse(BaseModel):
    """A named landmark on the map."""
    name: str
    grid_x: int
    grid_y: int
