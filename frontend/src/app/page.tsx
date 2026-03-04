import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { ExploreMaps } from "@/components/landing/ExploreMaps";
import { PokemonShowcase } from "@/components/landing/PokemonShowcase";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero />
      <PokemonShowcase />
      <ExploreMaps />
      <Features />
    </main>
  );
}
