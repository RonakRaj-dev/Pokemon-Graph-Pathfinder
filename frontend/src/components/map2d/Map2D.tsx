"use client"

import { motion } from "framer-motion";
import Image from "next/image";
import { PathResult } from "@/types";

interface Map2DProps {
  paths: PathResult[];
  selectedPath: PathResult | null;
}

export const Map2D = ({ paths, selectedPath }: Map2DProps) => {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border-4 border-white shadow-2xl bg-slate-100">
      <Image
        src="/maps/kanto.png" // Default map for now, ideally dynamic based on city
        alt="Region Map"
        fill
        className="object-cover"
        onError={(e) => {
             e.currentTarget.style.display = 'none';
             e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center', 'bg-muted');
             e.currentTarget.parentElement!.innerHTML = `<div class="text-center p-8"><h3 class="text-2xl font-bold text-muted-foreground">Map View</h3><p class="text-sm text-muted-foreground mt-2">Map image not found. This is a placeholder for the 2D map experience.</p></div>`;
        }}
      />
      
      {/* Overlay for routes can be added here later */}
      <div className="absolute top-4 left-4 bg-white/90 p-4 rounded-lg shadow-md backdrop-blur-sm">
        <h3 className="font-bold text-lg text-foreground">2D Navigation</h3>
        <p className="text-sm text-muted-foreground">
          {selectedPath ? `Showing: ${selectedPath.name}` : "Select a path to view route"}
        </p>
      </div>
    </div>
  );
};
