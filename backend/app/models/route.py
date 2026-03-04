"""
Pydantic models for pathfinding requests and responses.
"""

from __future__ import annotations

from pydantic import BaseModel, Field, field_validator
from typing import Optional


# ─── Core types ──────────────────────────────────────────────────────────────

class Coordinate(BaseModel):
    """A grid coordinate (0-indexed)."""
    x: int = Field(..., ge=0, lt=28, description="Grid column (0–27)")
    y: int = Field(..., ge=0, lt=20, description="Grid row (0–19)")


# ─── Request schemas ─────────────────────────────────────────────────────────

class PathRequest(BaseModel):
    """POST /find-path request body."""
    start: Coordinate
    goal: Coordinate
    algorithm: str = Field(
        default="a_star",
        description="Pathfinding algorithm: a_star, dijkstra, bellman_ford, bfs, greedy_best_first",
    )

    @field_validator("algorithm")
    @classmethod
    def validate_algorithm(cls, v: str) -> str:
        allowed = {"a_star", "dijkstra", "bellman_ford", "bfs", "greedy_best_first"}
        if v not in allowed:
            raise ValueError(f"Unknown algorithm '{v}'. Allowed: {sorted(allowed)}")
        return v


class CompareRequest(BaseModel):
    """POST /compare-algorithms request body."""
    start: Coordinate
    goal: Coordinate


# ─── Response schemas ────────────────────────────────────────────────────────

class PathResponse(BaseModel):
    """Successful pathfinding result."""
    path: list[Coordinate]
    total_cost: float
    algorithm_used: str
    nodes_explored: int
    path_length: int
    terrain_summary: dict[str, int] = Field(
        default_factory=dict,
        description="Count of terrain types traversed (e.g. {'road': 5, 'forest': 3})",
    )
    pokemon_on_path: list[str] = Field(
        default_factory=list,
        description="Pokémon encountered along the path",
    )


class AlgorithmComparison(BaseModel):
    """Result of a single algorithm in a comparison."""
    algorithm: str
    path: list[Coordinate]
    total_cost: float
    nodes_explored: int
    path_length: int
    execution_time_ms: float


class CompareResponse(BaseModel):
    """POST /compare-algorithms response."""
    start: Coordinate
    goal: Coordinate
    results: list[AlgorithmComparison]


class GridResponse(BaseModel):
    """GET /grid response."""
    cols: int
    rows: int
    weights: list[list[int]]
    tile_size_px: int = 32


class CellResponse(BaseModel):
    """GET /grid/cell/{x}/{y} response."""
    x: int
    y: int
    weight: int
    terrain: str
    pokemon: list[str]
    city: str
    landmark: str


class ErrorResponse(BaseModel):
    """Error response schema."""
    detail: str
