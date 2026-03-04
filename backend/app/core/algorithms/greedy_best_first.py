"""
Greedy Best-First Search — heuristic-only pathfinding.

Uses only the Manhattan distance heuristic (no accumulated cost).
Very fast but does NOT guarantee the optimal (cheapest) path.
Tends to find a path quickly by always moving toward the goal.

Time Complexity : O(E · log V) worst case
Space Complexity: O(V)
Optimality      : NOT guaranteed
"""

from __future__ import annotations

import heapq
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.core.graph import WeightedGrid

from app.core.algorithms.a_star import PathResult


def _manhattan(x1: int, y1: int, x2: int, y2: int) -> int:
    return abs(x1 - x2) + abs(y1 - y2)


def find_path(
    grid: "WeightedGrid",
    start: tuple[int, int],
    goal: tuple[int, int],
) -> PathResult | None:
    """
    Greedy Best-First Search using Manhattan distance.

    Priority is solely the heuristic h(n); accumulated cost g(n) is
    ignored during node selection (but tracked for the result).
    """
    sx, sy = start
    gx, gy = goal

    if not grid.in_bounds(sx, sy) or not grid.in_bounds(gx, gy):
        return None
    if not grid.is_passable(sx, sy) or not grid.is_passable(gx, gy):
        return None

    counter = 0
    # Priority queue sorted by heuristic only
    open_set: list[tuple[int, int, int, int]] = []
    heapq.heappush(open_set, (_manhattan(sx, sy, gx, gy), counter, sx, sy))

    came_from: dict[tuple[int, int], tuple[int, int]] = {}
    cost_so_far: dict[tuple[int, int], float] = {(sx, sy): 0}
    visited: set[tuple[int, int]] = set()
    nodes_explored = 0

    while open_set:
        _, _, cx, cy = heapq.heappop(open_set)
        current = (cx, cy)

        if current in visited:
            continue

        visited.add(current)
        nodes_explored += 1

        if current == (gx, gy):
            path = _reconstruct(came_from, current)
            return PathResult(
                path=path,
                total_cost=cost_so_far[current],
                nodes_explored=nodes_explored,
            )

        for (nx, ny), move_cost in grid.neighbors(cx, cy):
            neighbor = (nx, ny)
            if neighbor in visited:
                continue

            new_cost = cost_so_far[current] + move_cost
            if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]:
                cost_so_far[neighbor] = new_cost
                came_from[neighbor] = current
                h = _manhattan(nx, ny, gx, gy)
                counter += 1
                heapq.heappush(open_set, (h, counter, nx, ny))

    return None


def _reconstruct(
    came_from: dict[tuple[int, int], tuple[int, int]],
    current: tuple[int, int],
) -> list[tuple[int, int]]:
    path = [current]
    while current in came_from:
        current = came_from[current]
        path.append(current)
    path.reverse()
    return path
