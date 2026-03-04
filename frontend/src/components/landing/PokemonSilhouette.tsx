"use client"

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const silhouettes = [
  // SVG paths for simple Pokemon shapes (mocked as circles/blobs for now if actual SVGs are complex, 
  // but let's try some simple polygon shapes or actual SVG paths if I recall them)
  // Using simple generic monster shapes for copyright safety & simplicity
  "M20,20 Q40,5 60,20 T100,20 L100,50 L20,50 Z", // Basic shape
  "M50,10 Q80,10 80,40 T50,70 T20,40 T50,10 Z", // Round shape
];

export const PokemonSilhouette = () => {
    // Generate random positions
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
            {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-foreground/10 rounded-full blur-xl"
                    initial={{ 
                        x: Math.random() * 100 + "%", 
                        y: Math.random() * 100 + "%",
                        scale: 0.5 + Math.random() 
                    }}
                    animate={{ 
                        x: [
                            Math.random() * 100 + "%", 
                            Math.random() * 100 + "%", 
                            Math.random() * 100 + "%"
                        ],
                        y: [
                            Math.random() * 100 + "%", 
                            Math.random() * 100 + "%", 
                            Math.random() * 100 + "%"
                        ],
                    }}
                    transition={{
                        duration: 20 + Math.random() * 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        width: 100 + Math.random() * 200,
                        height: 100 + Math.random() * 200,
                    }}
                />
            ))}
        </div>
    );
}
