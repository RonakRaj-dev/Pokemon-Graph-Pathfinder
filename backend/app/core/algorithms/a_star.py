"""
A* Search Algorithm — optimal weighted pathfinding with Manhattan heuristic.

Time Complexity : O(E · log V)  where V = grid cells, E = edges
Space Complexity: O(V)
Optimality      : Guaranteed (with consistent heuristic)
"""

from __future__ import annotations

import heapq
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.core.graph import WeightedGrid


@dataclass
class PathResult:
    """Standard result returned by all pathfinding algorithms."""
    path: list[tuple[int, int]]
    total_cost: float
    nodes_explored: int


def _manhattan(x1: int, y1: int, x2: int, y2: int) -> int:
    """Manhattan distance heuristic (admissible for 4-directional movement)."""
    return abs(x1 - x2) + abs(y1 - y2)


def find_path(
    grid: "WeightedGrid",
    start: tuple[int, int],
    goal: tuple[int, int],
) -> PathResult | None:
    """
    A* Search with Manhattan Distance heuristic.

    Parameters
    ----------
    grid  : WeightedGrid instance
    start : (x, y) start coordinate
    goal  : (x, y) goal coordinate

    Returns
    -------
    PathResult with optimal path and cost, or None if no path exists.
    """
    sx, sy = start
    gx, gy = goal

    if not grid.in_bounds(sx, sy) or not grid.in_bounds(gx, gy):
        return None
    if not grid.is_passable(sx, sy) or not grid.is_passable(gx, gy):
        return None

    # Priority queue: (f_score, tie_breaker, x, y)
    counter = 0
    open_set: list[tuple[float, int, int, int]] = []
    heapq.heappush(open_set, (0 + _manhattan(sx, sy, gx, gy), counter, sx, sy))

    # g_score[node] = cost of cheapest path from start to node
    g_score: dict[tuple[int, int], float] = {(sx, sy): 0}

    # came_from[node] = previous node on cheapest path
    came_from: dict[tuple[int, int], tuple[int, int]] = {}

    # Closed set for nodes already fully explored
    closed: set[tuple[int, int]] = set()

    nodes_explored = 0

    while open_set:
        f, _, cx, cy = heapq.heappop(open_set)
        current = (cx, cy)

        if current in closed:
            continue

        closed.add(current)
        nodes_explored += 1

        # Goal reached
        if current == (gx, gy):
            path = _reconstruct_path(came_from, current)
            return PathResult(
                path=path,
                total_cost=g_score[current],
                nodes_explored=nodes_explored,
            )

        # Explore neighbors
        for (nx, ny), move_cost in grid.neighbors(cx, cy):
            neighbor = (nx, ny)
            if neighbor in closed:
                continue

            tentative_g = g_score[current] + move_cost

            if tentative_g < g_score.get(neighbor, float("inf")):
                g_score[neighbor] = tentative_g
                came_from[neighbor] = current
                f_score = tentative_g + _manhattan(nx, ny, gx, gy)
                counter += 1
                heapq.heappush(open_set, (f_score, counter, nx, ny))

    # No path found
    return None


def _reconstruct_path(
    came_from: dict[tuple[int, int], tuple[int, int]],
    current: tuple[int, int],
) -> list[tuple[int, int]]:
    """Walk back through came_from to build the path from start to goal."""
    path = [current]
    while current in came_from:
        current = came_from[current]
        path.append(current)
    path.reverse()
    return path
