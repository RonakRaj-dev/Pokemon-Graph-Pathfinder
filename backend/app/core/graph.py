"""
WeightedGrid: Merges map.json (tilemap skeleton) and _annotations.coco.json
(Roboflow COCO export) into a weighted 2D matrix for pathfinding.

Grid Dimensions : 28 columns × 20 rows  (from map.json)
Image Dimensions: 892 × 630 px           (from annotations)
Tile Size       : ~31.86 × 31.5 px       (892/28, 630/20)

Weight mapping (by COCO category name):
    mountain / building  →  999  (impassable obstacle)
    forest               →    5  (slow terrain)
    water / seaway       →   15  (very slow terrain)
    path / road / city   →    1  (easy terrain)
    default (no label)   →    2  (open land / grass)
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from pathlib import Path
from typing import NamedTuple


# ─── Constants ───────────────────────────────────────────────────────────────

GRID_COLS = 28
GRID_ROWS = 20

# Derived from the single image in annotations (892 × 630)
IMAGE_WIDTH = 892
IMAGE_HEIGHT = 630

CELL_PX_W = IMAGE_WIDTH / GRID_COLS   # ≈ 31.857
CELL_PX_H = IMAGE_HEIGHT / GRID_ROWS  # = 31.5

# Terrain weight constants
WEIGHT_ROAD     = 1
WEIGHT_DEFAULT  = 2
WEIGHT_FOREST   = 5
WEIGHT_WATER    = 15
WEIGHT_OBSTACLE = 999

# Category-name substrings → weight
_TERRAIN_RULES: list[tuple[list[str], int]] = [
    # Obstacles (mountains, buildings, tunnels)
    (["mountain", "Mount.", "Rock Tunnel"], WEIGHT_OBSTACLE),
    # Water
    (["Seaway", "Seafoam"], WEIGHT_WATER),
    # Forest
    (["forest"], WEIGHT_FOREST),
    # Roads / cities / paths / gyms / landmarks
    (["Path", "City", "Town", "Island", "Plateau", "Victory Road",
      "Bills House", "Indigo"], WEIGHT_ROAD),
]


class Coord(NamedTuple):
    x: int
    y: int


@dataclass
class CellMeta:
    """Optional metadata attached to a grid cell."""
    terrain_label: str = ""
    pokemon_spawns: list[str] = field(default_factory=list)
    city_name: str = ""
    landmark_name: str = ""


@dataclass
class CityInfo:
    """A city / town / landmark parsed from annotations."""
    name: str
    grid_x: int
    grid_y: int
    bbox_px: tuple[float, float, float, float]  # (x, y, w, h) in pixels


@dataclass
class PokemonSpawn:
    """A Pokémon spawn point parsed from annotations."""
    name: str
    grid_x: int
    grid_y: int
    bbox_px: tuple[float, float, float, float]


# ─── WeightedGrid ────────────────────────────────────────────────────────────

class WeightedGrid:
    """
    28×20 weighted grid built by fusing map.json + annotations COCO JSON.

    Attributes
    ----------
    weights : list[list[int]]
        weights[row][col]  — movement cost for cell (col, row).
    meta    : list[list[CellMeta]]
        Per-cell metadata (Pokémon, city, terrain label).
    cities  : list[CityInfo]
    pokemon_spawns : list[PokemonSpawn]
    landmarks : list[CityInfo]
    """

    def __init__(self) -> None:
        self.cols = GRID_COLS
        self.rows = GRID_ROWS
        # 2D arrays indexed [row][col]
        self.weights: list[list[int]] = [
            [WEIGHT_DEFAULT] * GRID_COLS for _ in range(GRID_ROWS)
        ]
        self.meta: list[list[CellMeta]] = [
            [CellMeta() for _ in range(GRID_COLS)] for _ in range(GRID_ROWS)
        ]
        self.cities: list[CityInfo] = []
        self.pokemon_spawns: list[PokemonSpawn] = []
        self.landmarks: list[CityInfo] = []

    # ── Grid queries ─────────────────────────────────────────────────────

    def in_bounds(self, x: int, y: int) -> bool:
        return 0 <= x < self.cols and 0 <= y < self.rows

    def is_passable(self, x: int, y: int) -> bool:
        return self.weights[y][x] < WEIGHT_OBSTACLE

    def cost(self, x: int, y: int) -> int:
        return self.weights[y][x]

    def neighbors(self, x: int, y: int) -> list[tuple[Coord, int]]:
        """
        Return walkable 4-directional neighbors with their movement cost.

        Returns list of (Coord(nx, ny), cost_to_enter).
        """
        result: list[tuple[Coord, int]] = []
        for dx, dy in ((0, 1), (1, 0), (0, -1), (-1, 0)):
            nx, ny = x + dx, y + dy
            if self.in_bounds(nx, ny) and self.is_passable(nx, ny):
                result.append((Coord(nx, ny), self.weights[ny][nx]))
        return result

    def terrain_label(self, x: int, y: int) -> str:
        return self.meta[y][x].terrain_label or "open"

    # ── Serialisation helpers ────────────────────────────────────────────

    def weights_as_flat(self) -> list[list[int]]:
        """Return the grid as a 2D list (row-major) for JSON serialisation."""
        return self.weights

    def cell_info(self, x: int, y: int) -> dict:
        m = self.meta[y][x]
        return {
            "x": x,
            "y": y,
            "weight": self.weights[y][x],
            "terrain": m.terrain_label or "open",
            "pokemon": m.pokemon_spawns,
            "city": m.city_name,
            "landmark": m.landmark_name,
        }


# ─── Builder ─────────────────────────────────────────────────────────────────

def _px_to_grid(px_x: float, px_y: float) -> Coord:
    """Convert pixel coordinates to grid coordinates (clamped)."""
    gx = min(int(px_x / CELL_PX_W), GRID_COLS - 1)
    gy = min(int(px_y / CELL_PX_H), GRID_ROWS - 1)
    return Coord(max(0, gx), max(0, gy))


def _bbox_to_grid_cells(bbox: list) -> list[Coord]:
    """
    Expand a COCO bbox [x, y, w, h] (pixels) into all grid cells it covers.
    """
    bx, by, bw, bh = (float(v) for v in bbox)
    top_left = _px_to_grid(bx, by)
    bottom_right = _px_to_grid(bx + bw, by + bh)
    cells: list[Coord] = []
    for gy in range(top_left.y, bottom_right.y + 1):
        for gx in range(top_left.x, bottom_right.x + 1):
            cells.append(Coord(gx, gy))
    return cells


def _classify_category(name: str) -> tuple[str, int] | None:
    """
    Determine the terrain weight for a COCO category name.
    Returns (terrain_label, weight) or None if not terrain.
    """
    for substrings, weight in _TERRAIN_RULES:
        for sub in substrings:
            if sub.lower() in name.lower():
                label_map = {
                    WEIGHT_OBSTACLE: "mountain",
                    WEIGHT_WATER:    "water",
                    WEIGHT_FOREST:   "forest",
                    WEIGHT_ROAD:     "road",
                }
                return label_map.get(weight, "road"), weight
    return None


def _is_pokemon(name: str) -> bool:
    """True if the category name is a Pokémon (contains 'Pokemon' or 'pokemon')."""
    return "pokemon" in name.lower()


def _is_city(name: str) -> bool:
    """True if category represents a city / town / island / plateau."""
    city_keywords = ["City", "Town", "Island", "Plateau"]
    return any(kw in name for kw in city_keywords)


def _is_landmark(name: str) -> bool:
    """True if category is a location landmark (not a city)."""
    landmark_keywords = ["Mount.", "Rock Tunnel", "Victory Road",
                         "Bills House", "Indigo"]
    return any(kw in name for kw in landmark_keywords)


def build_grid(
    map_json_path: str | Path,
    annotations_json_path: str | Path,
) -> WeightedGrid:
    """
    Build the weighted grid by merging both JSON data sources.

    Parameters
    ----------
    map_json_path : path to map.json (tilemap skeleton)
    annotations_json_path : path to _annotations.coco.json (Roboflow export)
    """
    grid = WeightedGrid()

    # 1) Load map.json — confirms grid dimensions (not strictly needed,
    #    but validates our assumptions)
    with open(map_json_path, "r", encoding="utf-8") as f:
        map_data = json.load(f)
    assert map_data["mapWidth"] == GRID_COLS
    assert map_data["mapHeight"] == GRID_ROWS

    # 2) Load annotations
    with open(annotations_json_path, "r", encoding="utf-8") as f:
        coco = json.load(f)

    # Category ID → name lookup
    cat_lookup: dict[int, str] = {c["id"]: c["name"] for c in coco["categories"]}

    # 3) Process every annotation
    for ann in coco["annotations"]:
        cat_id = ann["category_id"]
        cat_name = cat_lookup.get(cat_id, "")
        bbox = ann["bbox"]  # [x, y, w, h] in pixels
        bbox_tuple = tuple(float(v) for v in bbox)

        # --- Use segmentation polygon if available, else bbox ---
        cells: list[Coord]
        if ann.get("segmentation") and len(ann["segmentation"]) > 0 and len(ann["segmentation"][0]) > 0:
            # For paths with polygon segmentation, rasterise to grid cells
            cells = _polygon_to_grid_cells(ann["segmentation"][0])
        else:
            cells = _bbox_to_grid_cells(bbox)

        # 3a) Terrain classification
        terrain = _classify_category(cat_name)
        if terrain is not None:
            label, weight = terrain
            for c in cells:
                # Apply the most restrictive weight (highest value)
                if weight > grid.weights[c.y][c.x] or grid.weights[c.y][c.x] == WEIGHT_DEFAULT:
                    grid.weights[c.y][c.x] = weight
                    grid.meta[c.y][c.x].terrain_label = label

        # 3b) Pokémon spawns — register to ALL cells the bbox covers
        if _is_pokemon(cat_name):
            center = _px_to_grid(
                float(bbox[0]) + float(bbox[2]) / 2,
                float(bbox[1]) + float(bbox[3]) / 2,
            )
            spawn = PokemonSpawn(
                name=cat_name.replace(" Pokemon", "").replace(" pokemon", ""),
                grid_x=center.x,
                grid_y=center.y,
                bbox_px=bbox_tuple,
            )
            grid.pokemon_spawns.append(spawn)
            # Register the Pokémon name on EVERY cell its bbox covers
            bbox_cells = _bbox_to_grid_cells(bbox)
            for c in bbox_cells:
                if spawn.name not in grid.meta[c.y][c.x].pokemon_spawns:
                    grid.meta[c.y][c.x].pokemon_spawns.append(spawn.name)

        # 3c) City / Town / Island
        if _is_city(cat_name):
            center = _px_to_grid(
                float(bbox[0]) + float(bbox[2]) / 2,
                float(bbox[1]) + float(bbox[3]) / 2,
            )
            city = CityInfo(
                name=cat_name,
                grid_x=center.x,
                grid_y=center.y,
                bbox_px=bbox_tuple,
            )
            grid.cities.append(city)
            grid.meta[center.y][center.x].city_name = cat_name
            # Cities should be walkable
            for c in cells:
                if grid.weights[c.y][c.x] == WEIGHT_DEFAULT:
                    grid.weights[c.y][c.x] = WEIGHT_ROAD
                    grid.meta[c.y][c.x].terrain_label = "road"

        # 3d) Named landmarks
        if _is_landmark(cat_name):
            center = _px_to_grid(
                float(bbox[0]) + float(bbox[2]) / 2,
                float(bbox[1]) + float(bbox[3]) / 2,
            )
            landmark = CityInfo(
                name=cat_name,
                grid_x=center.x,
                grid_y=center.y,
                bbox_px=bbox_tuple,
            )
            grid.landmarks.append(landmark)
            grid.meta[center.y][center.x].landmark_name = cat_name

    return grid


def _polygon_to_grid_cells(polygon: list[float]) -> list[Coord]:
    """
    Convert a flat list of polygon coordinates [x1,y1,x2,y2,...] to grid cells.
    Uses a simple bounding-box + point-in-polygon rasterisation.
    """
    # Parse pairs
    points: list[tuple[float, float]] = []
    for i in range(0, len(polygon) - 1, 2):
        points.append((float(polygon[i]), float(polygon[i + 1])))

    if not points:
        return []

    # Bounding box of polygon in pixels
    min_px = min(p[0] for p in points)
    max_px = max(p[0] for p in points)
    min_py = min(p[1] for p in points)
    max_py = max(p[1] for p in points)

    tl = _px_to_grid(min_px, min_py)
    br = _px_to_grid(max_px, max_py)

    cells: list[Coord] = []
    for gy in range(tl.y, br.y + 1):
        for gx in range(tl.x, br.x + 1):
            # Check if the center of this grid cell falls inside the polygon
            cx = (gx + 0.5) * CELL_PX_W
            cy = (gy + 0.5) * CELL_PX_H
            if _point_in_polygon(cx, cy, points):
                cells.append(Coord(gx, gy))

    # Fallback: if no cells matched (very small polygon), use bbox
    if not cells:
        for gy in range(tl.y, br.y + 1):
            for gx in range(tl.x, br.x + 1):
                cells.append(Coord(gx, gy))

    return cells


def _point_in_polygon(x: float, y: float, poly: list[tuple[float, float]]) -> bool:
    """Ray-casting algorithm for point-in-polygon test."""
    n = len(poly)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside
