"use client"

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// This would typically come from a config or API, but hardcoding for now based on typical map names
const maps = [
  { name: "Kanto", src: "/maps/kanto.png" },
  { name: "Johto", src: "/maps/johto.png" },
  { name: "Hoenn", src: "/maps/hoenn.png" },
  { name: "Sinnoh", src: "/maps/sinnoh.png" },
];

export const ExploreMaps = () => {
  return (
    <section className="w-full py-20 bg-secondary/20">
      <div className="container px-4 md:px-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.5 }}
           className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Explore Regions</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
            Discover the vast world of Pokémon. Click on a map to view the details.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {maps.map((map, index) => (
            <motion.div
              key={map.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="group relative overflow-hidden rounded-xl bg-card shadow-lg hover:shadow-2xl transition-all"
            >
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer overflow-hidden aspect-video relative">
                    {/* Placeholder if image loads fail, or use next/image if files exist */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pokemon-blue/20 to-pokemon-red/20 z-0" />
                    <Image
                      src={map.src}
                      alt={`Map of ${map.name}`}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 relative z-10"
                      onError={(e) => {
                        // Fallback styling if image missing
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center', 'bg-muted');
                        e.currentTarget.parentElement!.innerHTML = `<span class="text-muted-foreground font-bold">${map.name}</span>`;
                      }}
                    />
                     <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20 translate-y-2 group-hover:translate-y-0 transition-transform">
                      <p className="text-white font-bold text-lg">{map.name}</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
                   <div className="relative w-full h-[80vh] bg-black/90 rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src={map.src}
                        alt={`Map of ${map.name}`}
                        fill
                        className="object-contain"
                      />
                   </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
