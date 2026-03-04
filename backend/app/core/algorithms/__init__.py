"""
Pathfinding algorithm registry.

Maps algorithm name strings to their find_path callables.
All algorithms share the interface:
    find_path(grid: WeightedGrid, start: tuple[int,int], goal: tuple[int,int])
        -> PathResult | None
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.core.graph import WeightedGrid

from app.core.algorithms.a_star import find_path as a_star
from app.core.algorithms.dijkstra import find_path as dijkstra
from app.core.algorithms.bellman_ford import find_path as bellman_ford
from app.core.algorithms.bfs import find_path as bfs
from app.core.algorithms.greedy_best_first import find_path as greedy_best_first

ALGORITHM_REGISTRY: dict[str, callable] = {
    "a_star": a_star,
    "dijkstra": dijkstra,
    "bellman_ford": bellman_ford,
    "bfs": bfs,
    "greedy_best_first": greedy_best_first,
}

ALGORITHM_NAMES = list(ALGORITHM_REGISTRY.keys())


def get_algorithm(name: str):
    """Retrieve a pathfinding function by name."""
    if name not in ALGORITHM_REGISTRY:
        raise ValueError(
            f"Unknown algorithm '{name}'. Available: {ALGORITHM_NAMES}"
        )
    return ALGORITHM_REGISTRY[name]
