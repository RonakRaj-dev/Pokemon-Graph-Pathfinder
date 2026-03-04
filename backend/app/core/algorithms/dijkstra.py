"""
Dijkstra's Algorithm — optimal shortest path (no heuristic).

Equivalent to A* with h(n) = 0.  Explores more nodes but guarantees
the shortest path on any non-negative weighted graph.

Time Complexity : O(E · log V)
Space Complexity: O(V)
Optimality      : Guaranteed
"""

from __future__ import annotations

import heapq
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.core.graph import WeightedGrid

from app.core.algorithms.a_star import PathResult


def find_path(
    grid: "WeightedGrid",
    start: tuple[int, int],
    goal: tuple[int, int],
) -> PathResult | None:
    """
    Dijkstra's shortest-path algorithm.

    Parameters
    ----------
    grid  : WeightedGrid instance
    start : (x, y) start coordinate
    goal  : (x, y) goal coordinate

    Returns
    -------
    PathResult with optimal path and cost, or None if unreachable.
    """
    sx, sy = start
    gx, gy = goal

    if not grid.in_bounds(sx, sy) or not grid.in_bounds(gx, gy):
        return None
    if not grid.is_passable(sx, sy) or not grid.is_passable(gx, gy):
        return None

    # Priority queue: (cost_so_far, tie_breaker, x, y)
    counter = 0
    pq: list[tuple[float, int, int, int]] = []
    heapq.heappush(pq, (0, counter, sx, sy))

    dist: dict[tuple[int, int], float] = {(sx, sy): 0}
    came_from: dict[tuple[int, int], tuple[int, int]] = {}
    visited: set[tuple[int, int]] = set()
    nodes_explored = 0

    while pq:
        cost, _, cx, cy = heapq.heappop(pq)
        current = (cx, cy)

        if current in visited:
            continue

        visited.add(current)
        nodes_explored += 1

        if current == (gx, gy):
            path = _reconstruct(came_from, current)
            return PathResult(
                path=path,
                total_cost=dist[current],
                nodes_explored=nodes_explored,
            )

        for (nx, ny), move_cost in grid.neighbors(cx, cy):
            neighbor = (nx, ny)
            if neighbor in visited:
                continue

            new_cost = dist[current] + move_cost
            if new_cost < dist.get(neighbor, float("inf")):
                dist[neighbor] = new_cost
                came_from[neighbor] = current
                counter += 1
                heapq.heappush(pq, (new_cost, counter, nx, ny))

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
