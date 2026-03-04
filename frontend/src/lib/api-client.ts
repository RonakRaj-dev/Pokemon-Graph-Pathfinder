/**
 * API Client for the Pokémon Pathfinder FastAPI backend.
 * 
 * Connects to http://localhost:8000/api/v1/
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_V1 = `${API_BASE}/api/v1`;

// ─── Types matching backend Pydantic models ──────────────────────────────────

export interface Coordinate {
  x: number;
  y: number;
}

export interface PathRequest {
  start: Coordinate;
  goal: Coordinate;
  algorithm?: string;
}

export interface PathResponse {
  path: Coordinate[];
  total_cost: number;
  algorithm_used: string;
  nodes_explored: number;
  path_length: number;
  terrain_summary: Record<string, number>;
  pokemon_on_path: string[];
}

export interface AlgorithmComparison {
  algorithm: string;
  path: Coordinate[];
  total_cost: number;
  nodes_explored: number;
  path_length: number;
  execution_time_ms: number;
}

export interface CompareResponse {
  start: Coordinate;
  goal: Coordinate;
  results: AlgorithmComparison[];
}

export interface CityInfo {
  name: string;
  grid_x: number;
  grid_y: number;
  bbox_px: number[];
}

export interface PokemonSpawn {
  name: string;
  grid_x: number;
  grid_y: number;
}

export interface LandmarkInfo {
  name: string;
  grid_x: number;
  grid_y: number;
}

export interface GridResponse {
  cols: number;
  rows: number;
  weights: number[][];
  tile_size_px: number;
}

export interface CellInfo {
  x: number;
  y: number;
  weight: number;
  terrain: string;
  pokemon: string[];
  city: string;
  landmark: string;
}

export interface MSTResponse {
  total_cost: number;
  num_edges: number;
  num_vertices: number;
  description: string;
}

// ─── API Functions ───────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || `API error: ${res.status}`);
  }
  return res.json();
}

/** POST /find-path */
export async function findPath(req: PathRequest): Promise<PathResponse> {
  return apiFetch<PathResponse>(`${API_V1}/find-path`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

/** POST /compare-algorithms */
export async function compareAlgorithms(
  start: Coordinate,
  goal: Coordinate
): Promise<CompareResponse> {
  return apiFetch<CompareResponse>(`${API_V1}/compare-algorithms`, {
    method: "POST",
    body: JSON.stringify({ start, goal }),
  });
}

/** GET /cities */
export async function getCities(): Promise<CityInfo[]> {
  return apiFetch<CityInfo[]>(`${API_V1}/cities`);
}

/** GET /pokemon-spawns */
export async function getPokemonSpawns(): Promise<PokemonSpawn[]> {
  return apiFetch<PokemonSpawn[]>(`${API_V1}/pokemon-spawns`);
}

/** GET /landmarks */
export async function getLandmarks(): Promise<LandmarkInfo[]> {
  return apiFetch<LandmarkInfo[]>(`${API_V1}/landmarks`);
}

/** GET /grid */
export async function getGrid(): Promise<GridResponse> {
  return apiFetch<GridResponse>(`${API_V1}/grid`);
}

/** GET /grid/cell/{x}/{y} */
export async function getCell(x: number, y: number): Promise<CellInfo> {
  return apiFetch<CellInfo>(`${API_V1}/grid/cell/${x}/${y}`);
}

/** GET /mst */
export async function getMST(): Promise<MSTResponse> {
  return apiFetch<MSTResponse>(`${API_V1}/mst`);
}
