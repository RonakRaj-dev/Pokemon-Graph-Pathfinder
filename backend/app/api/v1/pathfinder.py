"""
Pathfinder API routes — core pathfinding endpoints.

POST /find-path           → find path using a chosen algorithm
POST /compare-algorithms  → compare all algorithms on the same input
GET  /grid                → return the full weighted grid
GET  /grid/cell/{x}/{y}   → return info for a single cell
GET  /mst                 → return Minimum Spanning Tree stats
"""

from __future__ import annotations

import time
from typing import TYPE_CHECKING

from fastapi import APIRouter, HTTPException

from app.core.algorithms import ALGORITHM_NAMES, get_algorithm
from app.core.algorithms.kruskal import compute_mst
from app.models.route import (
    AlgorithmComparison,
    CellResponse,
    CompareRequest,
    CompareResponse,
    Coordinate,
    GridResponse,
    PathRequest,
    PathResponse,
)

if TYPE_CHECKING:
    from app.core.graph import WeightedGrid

router = APIRouter(tags=["Pathfinder"])

# Grid reference — set at startup by main.py
_grid: WeightedGrid | None = None


def set_grid(grid: "WeightedGrid") -> None:
    """Called once at app startup to inject the built grid."""
    global _grid
    _grid = grid


def _get_grid() -> "WeightedGrid":
    if _grid is None:
        raise HTTPException(status_code=503, detail="Grid not initialised yet")
    return _grid


# ─── POST /find-path ─────────────────────────────────────────────────────────

@router.post("/find-path", response_model=PathResponse)
async def find_path(req: PathRequest) -> PathResponse:
    """
    Find a path between two grid cells using the specified algorithm.
    Returns the path as a list of (x, y) coordinates, total cost,
    nodes explored, terrain summary, and Pokémon encountered.
    """
    grid = _get_grid()
    start = (req.start.x, req.start.y)
    goal = (req.goal.x, req.goal.y)

    # Validate start/goal are passable
    if not grid.is_passable(*start):
        raise HTTPException(
            status_code=400,
            detail=f"Start cell ({start[0]}, {start[1]}) is impassable "
                   f"(terrain: {grid.terrain_label(*start)}, weight: {grid.cost(*start)})",
        )
    if not grid.is_passable(*goal):
        raise HTTPException(
            status_code=400,
            detail=f"Goal cell ({goal[0]}, {goal[1]}) is impassable "
                   f"(terrain: {grid.terrain_label(*goal)}, weight: {grid.cost(*goal)})",
        )

    algo_fn = get_algorithm(req.algorithm)
    result = algo_fn(grid, start, goal)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"No path found from {start} to {goal} using {req.algorithm}",
        )

    # Build terrain summary and Pokémon list
    terrain_counts: dict[str, int] = {}
    pokemon_on_path: list[str] = []

    # Build a set of all cells on or adjacent to the path (1-cell radius)
    path_cells = set()
    for x, y in result.path:
        path_cells.add((x, y))
        # Add adjacent cells (1-cell radius) to catch nearby Pokémon
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                nx, ny = x + dx, y + dy
                if grid.in_bounds(nx, ny):
                    path_cells.add((nx, ny))

    for x, y in result.path:
        label = grid.terrain_label(x, y)
        terrain_counts[label] = terrain_counts.get(label, 0) + 1

    # Collect Pokémon from the path and all adjacent cells
    for (cx, cy) in path_cells:
        cell_meta = grid.meta[cy][cx]
        for pkmn in cell_meta.pokemon_spawns:
            if pkmn not in pokemon_on_path:
                pokemon_on_path.append(pkmn)

    return PathResponse(
        path=[Coordinate(x=x, y=y) for x, y in result.path],
        total_cost=result.total_cost,
        algorithm_used=req.algorithm,
        nodes_explored=result.nodes_explored,
        path_length=len(result.path),
        terrain_summary=terrain_counts,
        pokemon_on_path=pokemon_on_path,
    )


# ─── POST /compare-algorithms ───────────────────────────────────────────────

@router.post("/compare-algorithms", response_model=CompareResponse)
async def compare_algorithms(req: CompareRequest) -> CompareResponse:
    """
    Run all available pathfinding algorithms on the same start/goal
    and return a comparison of results (cost, nodes, time).
    """
    grid = _get_grid()
    start = (req.start.x, req.start.y)
    goal = (req.goal.x, req.goal.y)

    if not grid.is_passable(*start):
        raise HTTPException(status_code=400, detail=f"Start cell is impassable")
    if not grid.is_passable(*goal):
        raise HTTPException(status_code=400, detail=f"Goal cell is impassable")

    results: list[AlgorithmComparison] = []

    for name in ALGORITHM_NAMES:
        algo_fn = get_algorithm(name)
        t0 = time.perf_counter()
        result = algo_fn(grid, start, goal)
        elapsed_ms = (time.perf_counter() - t0) * 1000

        if result is not None:
            results.append(AlgorithmComparison(
                algorithm=name,
                path=[Coordinate(x=x, y=y) for x, y in result.path],
                total_cost=result.total_cost,
                nodes_explored=result.nodes_explored,
                path_length=len(result.path),
                execution_time_ms=round(elapsed_ms, 3),
            ))

    return CompareResponse(
        start=req.start,
        goal=req.goal,
        results=results,
    )


# ─── GET /grid ────────────────────────────────────────────────────────────────

@router.get("/grid", response_model=GridResponse)
async def get_grid() -> GridResponse:
    """Return the full weighted grid as a 2D matrix."""
    grid = _get_grid()
    return GridResponse(
        cols=grid.cols,
        rows=grid.rows,
        weights=grid.weights_as_flat(),
    )


# ─── GET /grid/cell/{x}/{y} ──────────────────────────────────────────────────

@router.get("/grid/cell/{x}/{y}", response_model=CellResponse)
async def get_cell(x: int, y: int) -> CellResponse:
    """Return weight and metadata for a specific grid cell."""
    grid = _get_grid()
    if not grid.in_bounds(x, y):
        raise HTTPException(
            status_code=400,
            detail=f"Cell ({x}, {y}) is out of bounds (0–{grid.cols-1}, 0–{grid.rows-1})",
        )
    info = grid.cell_info(x, y)
    return CellResponse(**info)


# ─── GET /mst ─────────────────────────────────────────────────────────────────

@router.get("/mst")
async def get_mst():
    """Compute and return the Minimum Spanning Tree statistics for the grid."""
    grid = _get_grid()
    mst = compute_mst(grid)
    return {
        "total_cost": mst.total_cost,
        "num_edges": mst.num_edges,
        "num_vertices": mst.num_vertices,
        "description": "Kruskal's MST of all walkable grid cells",
    }
