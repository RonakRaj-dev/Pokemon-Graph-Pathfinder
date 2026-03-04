"""
Kruskal's Algorithm — Minimum Spanning Tree (MST).

Not a point-to-point pathfinder.  Computes the MST of the grid graph,
which is useful for analysing overall map connectivity and total
minimum cost to connect all walkable cells.

Time Complexity : O(E · log E)
Space Complexity: O(V + E)
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.core.graph import WeightedGrid


@dataclass
class MSTResult:
    """Result of Kruskal's MST computation."""
    total_cost: float
    num_edges: int
    num_vertices: int
    # We don't store all edges — too large for API response.
    # Instead store summary stats.


class UnionFind:
    """Disjoint Set Union (DSU) with path compression and union by rank."""

    def __init__(self) -> None:
        self.parent: dict[tuple[int, int], tuple[int, int]] = {}
        self.rank: dict[tuple[int, int], int] = {}

    def make_set(self, v: tuple[int, int]) -> None:
        self.parent[v] = v
        self.rank[v] = 0

    def find(self, v: tuple[int, int]) -> tuple[int, int]:
        if self.parent[v] != v:
            self.parent[v] = self.find(self.parent[v])  # Path compression
        return self.parent[v]

    def union(self, a: tuple[int, int], b: tuple[int, int]) -> bool:
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        # Union by rank
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        return True


def compute_mst(grid: "WeightedGrid") -> MSTResult:
    """
    Compute the Minimum Spanning Tree of all walkable grid cells
    using Kruskal's algorithm.
    """
    uf = UnionFind()
    edges: list[tuple[int, tuple[int, int], tuple[int, int]]] = []

    # Build vertices and edges
    for y in range(grid.rows):
        for x in range(grid.cols):
            if grid.is_passable(x, y):
                uf.make_set((x, y))
                for (nx, ny), cost in grid.neighbors(x, y):
                    # Avoid duplicate edges: only add if neighbor > current
                    if (nx, ny) > (x, y):
                        edges.append((cost, (x, y), (nx, ny)))

    # Sort edges by weight
    edges.sort(key=lambda e: e[0])

    total_cost = 0.0
    num_edges = 0
    num_vertices = len(uf.parent)

    for weight, u, v in edges:
        if uf.union(u, v):
            total_cost += weight
            num_edges += 1
            if num_edges == num_vertices - 1:
                break

    return MSTResult(
        total_cost=total_cost,
        num_edges=num_edges,
        num_vertices=num_vertices,
    )
