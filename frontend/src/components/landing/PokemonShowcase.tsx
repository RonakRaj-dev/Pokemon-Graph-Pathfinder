"use client"

import { motion } from "framer-motion";
import { FadeSlideIn, StaggerContainer, StaggerItem } from "@/components/ui/animated-text";

/** Showcase Pokémon: name, Pokédex ID, type(s), color theme */
const SHOWCASE_POKEMON = [
  { name: "Pikachu", id: 25, types: ["Electric"], gradient: "from-yellow-400 to-amber-500" },
  { name: "Charizard", id: 6, types: ["Fire", "Flying"], gradient: "from-orange-500 to-red-600" },
  { name: "Mewtwo", id: 150, types: ["Psychic"], gradient: "from-purple-500 to-indigo-600" },
  { name: "Blastoise", id: 9, types: ["Water"], gradient: "from-blue-400 to-cyan-600" },
  { name: "Venusaur", id: 3, types: ["Grass", "Poison"], gradient: "from-green-500 to-emerald-600" },
  { name: "Dragonite", id: 149, types: ["Dragon", "Flying"], gradient: "from-amber-400 to-orange-500" },
  { name: "Gengar", id: 94, types: ["Ghost", "Poison"], gradient: "from-purple-700 to-violet-900" },
  { name: "Gyarados", id: 130, types: ["Water", "Flying"], gradient: "from-blue-600 to-indigo-700" },
  { name: "Snorlax", id: 143, types: ["Normal"], gradient: "from-slate-400 to-slate-600" },
  { name: "Lapras", id: 131, types: ["Water", "Ice"], gradient: "from-sky-400 to-blue-500" },
  { name: "Arcanine", id: 59, types: ["Fire"], gradient: "from-orange-400 to-red-500" },
  { name: "Alakazam", id: 65, types: ["Psychic"], gradient: "from-yellow-500 to-amber-600" },
];

const TYPE_COLORS: Record<string, string> = {
  Electric: "bg-yellow-400 text-black",
  Fire: "bg-red-500 text-white",
  Flying: "bg-sky-300 text-black",
  Psychic: "bg-purple-500 text-white",
  Water: "bg-blue-500 text-white",
  Grass: "bg-green-500 text-white",
  Poison: "bg-purple-600 text-white",
  Dragon: "bg-indigo-600 text-white",
  Ghost: "bg-purple-800 text-white",
  Normal: "bg-gray-400 text-black",
  Ice: "bg-cyan-300 text-black",
};

function getSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export const PokemonShowcase = () => {
  return (
    <section className="w-full py-20 bg-gradient-to-b from-background via-secondary/10 to-background overflow-hidden">
      <div className="container px-4 md:px-6">
        <FadeSlideIn direction="up" className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Pokémon You&apos;ll <span className="text-pokemon-red">Encounter</span>
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
            Over 130 Gen I Pokémon are annotated on the Kanto map.
            Here are some fan favorites you might encounter on your journey.
          </p>
        </FadeSlideIn>

        <StaggerContainer
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          staggerDelay={0.07}
        >
          {SHOWCASE_POKEMON.map((pkmn, i) => (
            <StaggerItem key={pkmn.id}>
              <div className="pokemon-card group relative rounded-2xl overflow-hidden border bg-card shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${pkmn.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
                />

                {/* Sprite with floating animation */}
                <div className="relative flex items-center justify-center pt-4 pb-2">
                  <motion.img
                    src={getSpriteUrl(pkmn.id)}
                    alt={pkmn.name}
                    className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg group-hover:drop-shadow-2xl transition-all"
                    loading="lazy"
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 2 + (i % 3) * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.1,
                    }}
                  />
                </div>

                {/* Info */}
                <div className="relative text-center pb-4 px-2">
                  <p className="text-[10px] text-muted-foreground font-mono">
                    #{String(pkmn.id).padStart(3, "0")}
                  </p>
                  <h3 className="font-bold text-sm md:text-base group-hover:text-pokemon-red transition-colors">
                    {pkmn.name}
                  </h3>
                  <div className="flex gap-1 justify-center mt-1.5 flex-wrap">
                    {pkmn.types.map((type) => (
                      <span
                        key={type}
                        className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                          TYPE_COLORS[type] || "bg-gray-300 text-black"
                        }`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-pokemon-yellow/50 transition-colors pointer-events-none" />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
