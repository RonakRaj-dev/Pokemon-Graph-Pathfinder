"use client"

import { KantoMap } from "@/components/map/KantoMap";
import { PokemonSilhouette } from "@/components/landing/PokemonSilhouette";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  findPath,
  getCities,
  getPokemonSpawns,
  compareAlgorithms,
  type PathResponse,
  type CityInfo,
  type PokemonSpawn,
  type AlgorithmComparison,
} from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Zap, Route, Play, BarChart3, Sparkles } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

const ALGORITHMS = [
  { id: "a_star", label: "A* Search", desc: "Optimal + Fast", icon: "⭐" },
  { id: "dijkstra", label: "Dijkstra", desc: "Optimal", icon: "🔷" },
  { id: "bellman_ford", label: "Bellman-Ford", desc: "Handles negatives", icon: "🔶" },
  { id: "bfs", label: "BFS", desc: "Fewest hops", icon: "🟢" },
  { id: "greedy_best_first", label: "Greedy Best", desc: "Fastest, not optimal", icon: "⚡" },
];

export default function PathFinderPage() {
  // ── Data from backend ──────────────────────────────────────────────
  const [cities, setCities] = useState<CityInfo[]>([]);
  const [pokemonSpawns, setPokemonSpawns] = useState<PokemonSpawn[]>([]);
  const [loading, setLoading] = useState(true);

  // ── User selections ────────────────────────────────────────────────
  const [startCity, setStartCity] = useState<CityInfo | null>(null);
  const [goalCity, setGoalCity] = useState<CityInfo | null>(null);
  const [algorithm, setAlgorithm] = useState("a_star");

  // ── Results ─────────────────────────────────────────────────────────
  const [pathResult, setPathResult] = useState<PathResponse | null>(null);
  const [comparison, setComparison] = useState<AlgorithmComparison[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load cities and spawns on mount ────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [citiesData, spawnsData] = await Promise.all([
          getCities(),
          getPokemonSpawns(),
        ]);
        setCities(citiesData);
        setPokemonSpawns(spawnsData);
      } catch (err) {
        console.error("Failed to load map data:", err);
        setError("Failed to connect to the Pokémon Pathfinder API. Make sure the backend is running on port 8000.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Find Path ──────────────────────────────────────────────────────
  const handleFindPath = useCallback(async () => {
    if (!startCity || !goalCity) return;
    setIsSearching(true);
    setError(null);
    setPathResult(null);
    setComparison(null);

    try {
      const result = await findPath({
        start: { x: startCity.grid_x, y: startCity.grid_y },
        goal: { x: goalCity.grid_x, y: goalCity.grid_y },
        algorithm,
      });
      setPathResult(result);
      setIsAnimating(true);
    } catch (err: any) {
      setError(err.message || "Pathfinding failed");
    } finally {
      setIsSearching(false);
    }
  }, [startCity, goalCity, algorithm]);

  // ── Compare All Algorithms ─────────────────────────────────────────
  const handleCompare = useCallback(async () => {
    if (!startCity || !goalCity) return;
    setIsSearching(true);
    setError(null);
    setComparison(null);

    try {
      const result = await compareAlgorithms(
        { x: startCity.grid_x, y: startCity.grid_y },
        { x: goalCity.grid_x, y: goalCity.grid_y },
      );
      setComparison(result.results);
      // Show the A* path by default
      const astar = result.results.find((r) => r.algorithm === "a_star");
      if (astar) {
        setPathResult({
          path: astar.path,
          total_cost: astar.total_cost,
          algorithm_used: astar.algorithm,
          nodes_explored: astar.nodes_explored,
          path_length: astar.path_length,
          terrain_summary: {},
          pokemon_on_path: [],
        });
      }
    } catch (err: any) {
      setError(err.message || "Comparison failed");
    } finally {
      setIsSearching(false);
    }
  }, [startCity, goalCity]);

  if (loading) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-pokemon-red border-t-transparent rounded-full"
        />
        <p className="mt-4 text-pokemon-blue font-semibold animate-pulse text-lg">Loading Kanto Map Data...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center py-8 px-4 overflow-x-hidden relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <PokemonSilhouette />

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-10 text-center mb-6"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">
          <span className="text-pokemon-red">Kanto</span> Path Finder
        </h1>
        <p className="text-muted-foreground text-lg">
          Select cities on the map and find the optimal path through the Pokémon world
        </p>
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl mb-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-center text-sm z-10"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-5xl z-10 mb-6"
      >
        <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-pokemon-blue/20 shadow-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-pokemon-blue flex items-center gap-2">
              <Route className="h-5 w-5" />
              Plan Your Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Start City */}
              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Start City
                </Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={startCity?.name || ""}
                  onChange={(e) => {
                    const city = cities.find((c) => c.name === e.target.value);
                    setStartCity(city || null);
                  }}
                >
                  <option value="">Select start...</option>
                  {cities.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Goal City */}
              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Goal City
                </Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={goalCity?.name || ""}
                  onChange={(e) => {
                    const city = cities.find((c) => c.name === e.target.value);
                    setGoalCity(city || null);
                  }}
                >
                  <option value="">Select goal...</option>
                  {cities.filter((c) => c.name !== startCity?.name).map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Algorithm */}
              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Algorithm
                </Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                >
                  {ALGORITHMS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.icon} {a.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="pokemon"
                  className="flex-1 font-bold"
                  disabled={!startCity || !goalCity || isSearching}
                  onClick={handleFindPath}
                >
                  {isSearching ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                      ⚡
                    </motion.span>
                  ) : (
                    <Play className="h-4 w-4 mr-1" />
                  )}
                  Find Path
                </Button>
                <Button
                  variant="outline"
                  className="font-bold"
                  disabled={!startCity || !goalCity || isSearching}
                  onClick={handleCompare}
                  title="Compare all algorithms"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-5xl z-10"
      >
        <KantoMap
          pathResult={pathResult}
          pokemonSpawns={pokemonSpawns}
          cities={cities}
          isAnimating={isAnimating}
          onAnimationEnd={() => setIsAnimating(false)}
        />
      </motion.div>

      {/* Algorithm Comparison Table */}
      <AnimatePresence>
        {comparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-5xl z-10 mt-6"
          >
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-pokemon-yellow/30 shadow-xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-pokemon-blue">
                  <BarChart3 className="h-5 w-5" />
                  Algorithm Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left font-bold">Algorithm</th>
                        <th className="px-4 py-3 text-right font-bold">Cost</th>
                        <th className="px-4 py-3 text-right font-bold">Path Length</th>
                        <th className="px-4 py-3 text-right font-bold">Nodes Explored</th>
                        <th className="px-4 py-3 text-right font-bold">Time (ms)</th>
                        <th className="px-4 py-3 text-center font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((r, i) => {
                        const best = comparison.reduce((a, b) => a.total_cost < b.total_cost ? a : b);
                        const fastest = comparison.reduce((a, b) => a.execution_time_ms < b.execution_time_ms ? a : b);
                        const isBest = r.total_cost === best.total_cost;
                        const isFastest = r.execution_time_ms === fastest.execution_time_ms;
                        return (
                          <motion.tr
                            key={r.algorithm}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-3 font-semibold">
                              {ALGORITHMS.find((a) => a.id === r.algorithm)?.icon}{" "}
                              {ALGORITHMS.find((a) => a.id === r.algorithm)?.label || r.algorithm}
                              {isBest && <span className="ml-2 text-[10px] bg-green-500/20 text-green-600 px-1.5 py-0.5 rounded-full font-bold">OPTIMAL</span>}
                              {isFastest && <span className="ml-1 text-[10px] bg-blue-500/20 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">FASTEST</span>}
                            </td>
                            <td className="px-4 py-3 text-right font-mono">{r.total_cost}</td>
                            <td className="px-4 py-3 text-right font-mono">{r.path_length}</td>
                            <td className="px-4 py-3 text-right font-mono">{r.nodes_explored.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-mono">{r.execution_time_ms.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                                onClick={() => {
                                  setPathResult({
                                    path: r.path,
                                    total_cost: r.total_cost,
                                    algorithm_used: r.algorithm,
                                    nodes_explored: r.nodes_explored,
                                    path_length: r.path_length,
                                    terrain_summary: {},
                                    pokemon_on_path: [],
                                  });
                                  setIsAnimating(true);
                                }}
                              >
                                <MapPin className="h-3 w-3 mr-1" /> Show
                              </Button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Path Details */}
      <AnimatePresence>
        {pathResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-5xl z-10 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Terrain Summary */}
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-emerald-600">🌍 Terrain Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(pathResult.terrain_summary).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(pathResult.terrain_summary).map(([terrain, count]) => (
                      <div key={terrain} className="flex justify-between items-center">
                        <span className="text-sm capitalize flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            terrain === "road" ? "bg-gray-400" :
                            terrain === "forest" ? "bg-green-500" :
                            terrain === "water" ? "bg-blue-500" :
                            terrain === "mountain" ? "bg-amber-700" : "bg-gray-300"
                          }`} />
                          {terrain}
                        </span>
                        <span className="text-sm font-mono font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Run single path (not compare) for terrain data</p>
                )}
              </CardContent>
            </Card>

            {/* Path Stats */}
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-pokemon-blue">📊 Path Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="font-bold text-pokemon-red">{pathResult.total_cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Path Length</span>
                    <span className="font-bold">{pathResult.path_length} cells</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nodes Explored</span>
                    <span className="font-bold text-blue-600">{pathResult.nodes_explored.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Algorithm</span>
                    <span className="font-bold text-emerald-600">{pathResult.algorithm_used.replace(/_/g, " ").toUpperCase()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pokémon Encounters */}
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-pokemon-yellow flex items-center gap-1">
                  <Zap className="h-4 w-4" /> Pokémon Encounters
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pathResult.pokemon_on_path.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {pathResult.pokemon_on_path.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 bg-pokemon-yellow/10 text-foreground text-xs px-2 py-1 rounded-full border border-pokemon-yellow/30"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No Pokémon on this path (try a different route!)</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacer */}
      <div className="h-12" />
    </main>
  );
}
