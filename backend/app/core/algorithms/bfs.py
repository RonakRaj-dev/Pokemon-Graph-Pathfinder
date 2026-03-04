"""
Breadth-First Search (BFS) — unweighted shortest path.

Finds the path with the fewest hops, ignoring terrain weights.
Useful for comparison: shows the "straightest" route regardless
of terrain difficulty.

Time Complexity : O(V + E)
Space Complexity: O(V)
Optimality      : Yes, for unweighted (hop-count) graphs
"""

from __future__ import annotations

from collections import deque
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
    BFS on the grid, treating all passable cells as having equal cost.

    The total_cost returned is the sum of actual weights along the path
    (for fair comparison), even though BFS ignores them during search.
    """
    sx, sy = start
    gx, gy = goal

    if not grid.in_bounds(sx, sy) or not grid.in_bounds(gx, gy):
        return None
    if not grid.is_passable(sx, sy) or not grid.is_passable(gx, gy):
        return None

    queue: deque[tuple[int, int]] = deque()
    queue.append((sx, sy))
    visited: set[tuple[int, int]] = {(sx, sy)}
    came_from: dict[tuple[int, int], tuple[int, int]] = {}
    nodes_explored = 0

    while queue:
        cx, cy = queue.popleft()
        nodes_explored += 1

        if (cx, cy) == (gx, gy):
            path = _reconstruct(came_from, (cx, cy))
            # Calculate actual weighted cost for comparison
            total_cost = sum(grid.cost(px, py) for px, py in path[1:])
            return PathResult(
                path=path,
                total_cost=total_cost,
                nodes_explored=nodes_explored,
            )

        for (nx, ny), _ in grid.neighbors(cx, cy):
            if (nx, ny) not in visited:
                visited.add((nx, ny))
                came_from[(nx, ny)] = (cx, cy)
                queue.append((nx, ny))

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
