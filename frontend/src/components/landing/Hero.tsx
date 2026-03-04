"use client"

import { Button } from "@/components/ui/button";
import { SplitText, BlurText, FadeSlideIn } from "@/components/ui/animated-text";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const Hero = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-background">
      {/* Sparkle/particle background */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-pokemon-yellow/40 dark:bg-pokemon-yellow/15"
              style={{
                width: 3 + Math.random() * 6,
                height: 3 + Math.random() * 6,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30 + Math.random() * 60, 0],
                x: [0, -20 + Math.random() * 40, 0],
                opacity: [0.1, 0.6, 0.1],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: 4 + Math.random() * 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Pokéballs */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-[5]">
          {[
            { left: "15%", top: "20%" },
            { left: "80%", top: "25%" },
            { left: "10%", top: "70%" },
            { left: "85%", top: "65%" },
            { left: "50%", top: "12%" },
          ].map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-10 h-10 md:w-14 md:h-14 rounded-full border-4 border-pokemon-red/50 bg-white/80 dark:bg-white/20 hidden md:block"
              style={{ left: pos.left, top: pos.top }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 0.5,
                y: [0, -20, 0, 15, 0],
                x: [0, 10, -10, 5, 0],
                rotate: [0, 5, -5, 3, 0],
              }}
              transition={{
                scale: { duration: 0.6, delay: 0.3 + i * 0.12, ease: "backOut" },
                opacity: { duration: 0.6, delay: 0.3 + i * 0.12 },
                y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-pokemon-red/40 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-400" />
            </motion.div>
          ))}
        </div>
      )}

      <div className="z-10 text-center space-y-6 max-w-4xl px-4">
        <div>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
            <SplitText
              text="Pokémon"
              className="text-pokemon-red"
              delay={0.2}
              staggerDelay={0.06}
              splitBy="char"
            />{" "}
            <SplitText
              text="Path Finder"
              delay={0.6}
              staggerDelay={0.05}
              splitBy="char"
            />
          </h1>
          <BlurText className="mt-4 text-xl md:text-2xl text-muted-foreground font-medium" delay={1}>
            Find the smartest path through the Pokémon world.
          </BlurText>
        </div>

        <FadeSlideIn delay={1.3} direction="up">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link href="/pathfinder">
              <Button
                size="lg"
                variant="pokemon"
                className="text-lg px-8 py-6 font-bold tracking-wider group"
              >
                <MapPin className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                Start Path Finder
              </Button>
            </Link>
            <Button size="lg" variant="ghost" className="text-lg px-8 py-6">
              Explore Map <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </FadeSlideIn>
      </div>

      <FadeSlideIn delay={1.8} direction="up" className="absolute bottom-10">
        <span className="text-sm text-muted-foreground animate-bounce inline-block">
          Scroll to explore
        </span>
      </FadeSlideIn>
    </section>
  );
};
