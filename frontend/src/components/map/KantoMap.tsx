"use client"

/**
 * KantoMap — Interactive map component that renders the Kanto region image
 * with SVG overlays for paths, Pokémon sprites, city markers, and an
 * animated walking character.
 *
 * The map image (kanto.jpg) is 892×630px.
 * The grid is 28×20 cells, so each cell is ~31.86×31.5px.
 */

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Coordinate, PathResponse, PokemonSpawn, CityInfo } from "@/lib/api-client";

// ─── Constants ───────────────────────────────────────────────────────────────

const MAP_W = 892;
const MAP_H = 630;
const GRID_COLS = 28;
const GRID_ROWS = 20;
const CELL_W = MAP_W / GRID_COLS;  // ~31.86
const CELL_H = MAP_H / GRID_ROWS;  // 31.5

/** Convert grid coordinate to pixel center */
function gridToPixel(gx: number, gy: number): { x: number; y: number } {
  return {
    x: (gx + 0.5) * CELL_W,
    y: (gy + 0.5) * CELL_H,
  };
}

// ─── Pokémon sprite URL (PokéAPI) ────────────────────────────────────────────

const POKEMON_NAME_TO_ID: Record<string, number> = {
  Bulbasaur: 1, Ivysaur: 2, Venusaur: 3, Charmandar: 4, Charmaleon: 5,
  Charizard: 6, Squirtle: 7, Warturtle: 8, Blastoise: 9, Caterpie: 10,
  Metapod: 11, Butterfree: 12, Weedle: 13, Kakuna: 14, Beedrill: 15,
  Pidgeotto: 99, Pidgeot: 18, Ratata: 19, Ratatta: 20, Spearrow: 21,
  Pikachu: 25, Sandslash: 28, Clefairy: 35, Clefable: 36, Vulpix: 37,
  Ninetales: 38, "jigglypuff": 39, Wigglytuff: 40, Zubat: 41, Golbat: 42,
  Oddish: 43, Gloom: 44, Vileplume: 45, Paras: 46, Parasect: 47,
  Venonat: 48, Venomoth: 49, Mankey: 56, Primeape: 57, Growlith: 58,
  Poliwhirl: 61, Poliwarth: 62, Abra: 63, Kadabra: 64, Alakazam: 65,
  Machop: 66, Machoke: 67, Machamp: 68, Weepingbell: 70, Victoribell: 71,
  Geodude: 74, Graveller: 75, Golem: 76, Ponyta: 77, Rapidash: 78,
  Slowpoke: 79, Slowbro: 80, Magnemite: 81, Magneton: 82,
  Doduo: 84, Dodrio: 85, Seel: 86, Dugong: 87, Grimer: 88, Muk: 89,
  Shellder: 90, Cloyster: 91, Gastly: 92, Hunter: 93, Gengar: 94,
  Onix: 95, Drowzee: 96, Hypno: 97, Craby: 98, Kingler: 99,
  Voltorb: 100, Electrode: 101, Eggsecute: 102, Exeggutor: 103,
  Cubone: 104, Marowak: 105, Hitmochan: 106, Hitmonlee: 107,
  Lickitung: 108, Koffing: 109, Weezing: 110, Rhyhorn: 111, Rhydon: 112,
  Chansey: 113, Tangela: 114, Kangaskhan: 115, Horsea: 116, Seadra: 117,
  Golduck: 55, Persian: 53, Psyduck: 54, Arbok: 24,
  Staryu: 120, Starmie: 121, "Mr. Mime": 122, Scyther: 123,
  Jynx: 124, Electabuzz: 125, Magmar: 126, Pinsir: 127, Taurus: 128,
  Magicarp: 129, Gyarados: 130, Lapras: 131, Ditto: 132,
  Evee: 133, Vaporeon: 134, Zolteon: 135, Flamaleon: 136,
  Polygon: 137, Omanyte: 138, Omastar: 139,
  Kabuto: 140, Kabutops: 141, Aerodactyle: 142,
  Snorlax: 143, Articuno: 144, Zapdos: 145, Moltres: 146,
  Dartini: 147, Dragonair: 148, Dragonite: 149,
  Mewtwo: 150, Mew: 151,
  Nidorina: 30, Nidoqueen: 31, Nidorino: 33, Nidoking: 34,
  Tentacool: 72, Tentacruel: 73,
};

function getPokemonSpriteUrl(name: string): string {
  const cleanName = name.replace(" Pokemon", "").replace(" pokemon", "").trim();
  const id = POKEMON_NAME_TO_ID[cleanName];
  if (id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }
  // Fallback: try lowercase name on PokeAPI
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Math.floor(Math.random() * 151) + 1}.png`;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface KantoMapProps {
  pathResult: PathResponse | null;
  pokemonSpawns: PokemonSpawn[];
  cities: CityInfo[];
  isAnimating: boolean;
  onAnimationEnd?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const KantoMap = ({
  pathResult,
  pokemonSpawns,
  cities,
  isAnimating,
  onAnimationEnd,
}: KantoMapProps) => {
  const [charIdx, setCharIdx] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [highlightedPokemon, setHighlightedPokemon] = useState<string | null>(null);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  const path = pathResult?.path || [];
  const pokemonOnPath = pathResult?.pokemon_on_path || [];

  // ── Build SVG polyline from path ─────────────────────────────────────
  const pathPoints = useMemo(() => {
    return path.map((c) => {
      const p = gridToPixel(c.x, c.y);
      return `${p.x},${p.y}`;
    }).join(" ");
  }, [path]);

  // ── Walking animation ────────────────────────────────────────────────
  useEffect(() => {
    if (isAnimating && path.length > 1) {
      setCharIdx(0);
      const interval = setInterval(() => {
        setCharIdx((prev) => {
          if (prev >= path.length - 1) {
            clearInterval(interval);
            onAnimationEnd?.();
            return prev;
          }
          return prev + 1;
        });
      }, 200);
      animRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [isAnimating, path.length]);

  const charPos = path.length > 0 ? gridToPixel(path[charIdx]?.x ?? 0, path[charIdx]?.y ?? 0) : null;

  // ── Pokémon along the path (show sprites at their grid positions) ────
  const pathPokemonSpawns = useMemo(() => {
    if (!pathResult || pokemonSpawns.length === 0) return [];
    // Build a set of all cells on or adjacent to the path (1-cell radius)
    const pathAdjacentSet = new Set<string>();
    const pathExactSet = new Set<string>();
    for (const c of path) {
      pathExactSet.add(`${c.x},${c.y}`);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          pathAdjacentSet.add(`${c.x + dx},${c.y + dy}`);
        }
      }
    }
    return pokemonSpawns
      .filter((p) => pathAdjacentSet.has(`${p.grid_x},${p.grid_y}`))
      .map((p) => ({
        ...p,
        isExactlyOnPath: pathExactSet.has(`${p.grid_x},${p.grid_y}`),
      }));
  }, [pathResult, pokemonSpawns, path]);

  // ── All visible Pokémon (scattered on the map, dimmed if not on path)
  const visiblePokemon = useMemo(() => {
    // Show a random subset of spawns across the map for visual appeal
    const shuffled = [...pokemonSpawns].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 40);
  }, [pokemonSpawns]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border-4 border-pokemon-yellow/60 shadow-2xl bg-slate-900">
      {/* Map Container - maintains aspect ratio */}
      <div className="relative w-full" style={{ paddingBottom: `${(MAP_H / MAP_W) * 100}%` }}>
        {/* Kanto Map Image */}
        <Image
          src="/maps/kanto.jpg"
          alt="Kanto Region Map"
          fill
          className="object-contain"
          priority
          onLoad={() => setMapLoaded(true)}
        />

        {/* SVG Overlay */}
        {mapLoaded && (
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "none" }}
          >
            {/* ── City markers ──────────────────────────────────── */}
            {cities.map((city) => {
              const p = gridToPixel(city.grid_x, city.grid_y);
              return (
                <g key={city.name}>
                  {/* Glow */}
                  <circle cx={p.x} cy={p.y} r={12} fill="rgba(255,222,0,0.3)" />
                  {/* Marker */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={6}
                    fill="#FFDE00"
                    stroke="#3B4CCA"
                    strokeWidth={2}
                  />
                  {/* Label */}
                  <text
                    x={p.x}
                    y={p.y - 14}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={8}
                    fontWeight="bold"
                    paintOrder="stroke"
                    stroke="#000"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {city.name.replace(" City", "").replace(" Town", "").replace(" Island", "")}
                  </text>
                </g>
              );
            })}

            {/* ── Path line (animated glow) ─────────────────────── */}
            {path.length > 1 && (
              <>
                {/* Shadow / glow */}
                <polyline
                  points={pathPoints}
                  fill="none"
                  stroke="rgba(255,0,0,0.4)"
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                />
                {/* Main path */}
                <polyline
                  points={pathPoints}
                  fill="none"
                  stroke="#FF3333"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="8,4"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="24"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </polyline>
                {/* Start marker */}
                {(() => {
                  const s = gridToPixel(path[0].x, path[0].y);
                  return (
                    <>
                      <circle cx={s.x} cy={s.y} r={8} fill="#22c55e" stroke="#fff" strokeWidth={2} />
                      <text x={s.x} y={s.y + 3} textAnchor="middle" fill="#fff" fontSize={9} fontWeight="bold">S</text>
                    </>
                  );
                })()}
                {/* Goal marker */}
                {(() => {
                  const g = gridToPixel(path[path.length - 1].x, path[path.length - 1].y);
                  return (
                    <>
                      <circle cx={g.x} cy={g.y} r={8} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                      <text x={g.x} y={g.y + 3} textAnchor="middle" fill="#fff" fontSize={9} fontWeight="bold">G</text>
                    </>
                  );
                })()}

                {/* SVG filters */}
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              </>
            )}
          </svg>
        )}

        {/* ── Pokémon sprites scattered on the map ───────────────── */}
        {mapLoaded && (
          <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
            {visiblePokemon.map((pkmn, i) => {
              const p = gridToPixel(pkmn.grid_x, pkmn.grid_y);
              const pathMatch = pathPokemonSpawns.find(
                (pp) => pp.grid_x === pkmn.grid_x && pp.grid_y === pkmn.grid_y
              );
              const isOnPath = !!pathMatch;
              const isExactlyOnPath = pathMatch?.isExactlyOnPath ?? false;
              const isHighlighted = highlightedPokemon === pkmn.name;
              const pxPercent = { x: (p.x / MAP_W) * 100, y: (p.y / MAP_H) * 100 };

              return (
                <motion.div
                  key={`${pkmn.name}-${i}`}
                  className="absolute"
                  style={{
                    left: `${pxPercent.x}%`,
                    top: `${pxPercent.y}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: isHighlighted ? 40 : isOnPath ? 20 : 5,
                    pointerEvents: "auto",
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isHighlighted ? 1.8 : isOnPath ? 1.2 : 0.7,
                    opacity: isHighlighted ? 1 : isOnPath ? 1 : 0.5,
                  }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  whileHover={{ scale: 1.5, opacity: 1, zIndex: 50 }}
                  title={pkmn.name}
                >
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPokemonSpriteUrl(pkmn.name)}
                      alt={pkmn.name}
                      width={isOnPath ? 36 : 24}
                      height={isOnPath ? 36 : 24}
                      className="drop-shadow-lg pixelated"
                      style={{ imageRendering: "pixelated" }}
                    />
                    {/* Pokémon name tooltip */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                      {pkmn.name}
                    </div>
                    {/* Glow ring — yellow for on-path, teal for nearby, bright red for highlighted */}
                    {(isOnPath || isHighlighted) && (
                      <motion.div
                        className={`absolute inset-0 rounded-full border-2 ${
                          isHighlighted
                            ? "border-red-400 shadow-lg shadow-red-400/50"
                            : isExactlyOnPath
                            ? "border-pokemon-yellow"
                            : "border-teal-400"
                        }`}
                        animate={{
                          scale: isHighlighted ? [1, 1.6, 1] : [1, 1.4, 1],
                          opacity: [1, 0, 1],
                        }}
                        transition={{ duration: isHighlighted ? 0.8 : 1.5, repeat: Infinity }}
                        style={{ margin: isHighlighted ? -8 : -4 }}
                      />
                    )}
                    {/* Highlighted name label */}
                    {isHighlighted && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded font-bold whitespace-nowrap z-50 pointer-events-none animate-pulse">
                        ⭐ {pkmn.name}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Walking character animation ─────────────────────── */}
        <AnimatePresence>
          {charPos && isAnimating && (
            <motion.div
              className="absolute z-30"
              style={{
                left: `${(charPos.x / MAP_W) * 100}%`,
                top: `${(charPos.y / MAP_H) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Character: Pokéball-style marker */}
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-8 h-8 rounded-full border-3 border-white shadow-xl"
                  style={{
                    background: "linear-gradient(180deg, #FF0000 50%, #FFFFFF 50%)",
                    boxShadow: "0 0 12px rgba(255,0,0,0.6), 0 0 24px rgba(255,0,0,0.3)",
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-gray-800" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Path info overlay ─────────────────────────────────────── */}
      {pathResult && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500" /> Start
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500" /> Goal
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span>Cost: <b className="text-pokemon-yellow">{pathResult.total_cost}</b></span>
              <span>Steps: <b className="text-pokemon-yellow">{pathResult.path_length}</b></span>
              <span>Explored: <b className="text-blue-400">{pathResult.nodes_explored}</b></span>
              <span>Algorithm: <b className="text-green-400">{pathResult.algorithm_used.replace("_", " ")}</b></span>
            </div>
          </div>

          {/* Pokémon encountered */}
          {pokemonOnPath.length > 0 && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-yellow-400 text-xs font-bold">Pokémon along path (click to locate):</span>
              {pokemonOnPath.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() =>
                    setHighlightedPokemon((prev) => (prev === name ? null : name))
                  }
                  className={`inline-flex items-center gap-1 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur cursor-pointer transition-all duration-200 hover:scale-110 border ${
                    highlightedPokemon === name
                      ? "bg-red-500/40 border-red-400 ring-1 ring-red-400/50 shadow-lg shadow-red-500/30"
                      : "bg-white/10 border-transparent hover:bg-white/20"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPokemonSpriteUrl(name)}
                    alt={name}
                    width={16}
                    height={16}
                    style={{ imageRendering: "pixelated" }}
                  />
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
