"""
Bellman-Ford Algorithm — shortest path that handles negative weights.

Not needed for this map (all weights ≥ 1), but included for comparison
and educational purposes.  Significantly slower: O(V · E).

Time Complexity : O(V · E)
Space Complexity: O(V)
Optimality      : Guaranteed (detects negative cycles)
"""

from __future__ import annotations

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
    Bellman-Ford shortest-path algorithm on the grid.

    Relaxes all edges V-1 times.  Much slower than A*/Dijkstra but
    handles negative edge weights (not present on this map).
    """
    sx, sy = start
    gx, gy = goal

    if not grid.in_bounds(sx, sy) or not grid.in_bounds(gx, gy):
        return None
    if not grid.is_passable(sx, sy) or not grid.is_passable(gx, gy):
        return None

    # Build explicit edge list from the grid
    # Each vertex is (x, y); each edge is (u, v, weight)
    vertices: list[tuple[int, int]] = []
    edges: list[tuple[tuple[int, int], tuple[int, int], int]] = []

    for y in range(grid.rows):
        for x in range(grid.cols):
            if grid.is_passable(x, y):
                vertices.append((x, y))
                for (nx, ny), cost in grid.neighbors(x, y):
                    edges.append(((x, y), (nx, ny), cost))

    V = len(vertices)
    nodes_explored = 0

    # Distance table
    dist: dict[tuple[int, int], float] = {v: float("inf") for v in vertices}
    dist[(sx, sy)] = 0
    came_from: dict[tuple[int, int], tuple[int, int]] = {}

    # Relax edges V - 1 times
    for i in range(V - 1):
        updated = False
        for u, v, w in edges:
            nodes_explored += 1
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                came_from[v] = u
                updated = True
        # Early termination if no updates occurred
        if not updated:
            break

    if dist.get((gx, gy), float("inf")) == float("inf"):
        return None

    # Reconstruct path
    path = [(gx, gy)]
    current = (gx, gy)
    while current in came_from:
        current = came_from[current]
        path.append(current)
    path.reverse()

    return PathResult(
        path=path,
        total_cost=dist[(gx, gy)],
        nodes_explored=nodes_explored,
    )
