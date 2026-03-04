"use client"

import { Grid, OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import { PokemonModel } from "./PokemonModel";
import { RouteLine } from "./RouteLine";
import { PathResult } from "@/types";

interface MapExperienceProps {
  paths: PathResult[];
  selectedPath: PathResult | null;
}

export const MapExperience = ({ paths, selectedPath }: MapExperienceProps) => {

  const visualPaths = useMemo(() => {
    // Generate mock coordinates if none exist
    return paths.map((path, idx) => {
      if (path.coordinates.length > 0) return path;

      // Generate a random path curve
      const points: {x: number, y:number, z:number}[] = [];
      const start = { x: -5, y: 0.5, z: 0 };
      const control = { x: (Math.random() - 0.5) * 10, y: 0.5, z: (Math.random() - 0.5) * 10 };
      const end = { x: 5, y: 0.5, z: 0 };

      // Simple quadratic bezier points
      for (let t = 0; t <= 1; t += 0.1) {
         const x = (1-t)*(1-t)*start.x + 2*(1-t)*t*control.x + t*t*end.x;
         const z = (1-t)*(1-t)*start.z + 2*(1-t)*t*control.z + t*t*end.z;
         // Add offset based on index so lines don't overlap perfectly
         points.push({ x: x, y: 0.5 + idx * 0.1, z: z + idx }); 
      }
      return { ...path, coordinates: points };
    });
  }, [paths]);

  return (
    <div className="w-full h-[500px] mt-8 rounded-xl overflow-hidden shadow-2xl border-2 border-pokemon-blue/20 bg-slate-900/50 backdrop-blur-sm relative">
      <Canvas shadows>
        <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 10, 15]} fov={50} />
            <OrbitControls 
                enablePan={true} 
                enableZoom={true} 
                maxPolarAngle={Math.PI / 2.2} 
                autoRotate={visualPaths.length === 0}
                autoRotateSpeed={0.5}
            />
            
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <Environment preset="city" />

            <Grid 
                infiniteGrid 
                fadeDistance={50} 
                sectionColor="#3B4CCA" 
                cellColor="#6c6c6c" 
                sectionThickness={1}
                cellThickness={0.5}
            />

            {/* Render Paths */}
            {visualPaths.map((path) => (
                <RouteLine 
                    key={path.id}
                    points={path.coordinates.map(p => [p.x, p.y, p.z])}
                    color={
                        path.type === 'Closest' ? '#22c55e' : 
                        path.type === 'Longest' ? '#3b82f6' : '#eab308'
                    }
                    active={selectedPath?.id === path.id}
                />
            ))}

            {/* Render Pokemon on Selected Path */}
            {selectedPath && visualPaths.find(p => p.id === selectedPath.id)?.coordinates.map((coord, i) => {
                if (i % 4 !== 0 || i === 0) return null; // Space them out
                
                // Use cyclic pokemon names from the list
                const name = selectedPath.encounters[i % selectedPath.encounters.length];
                
                return (
                    <PokemonModel 
                        key={`poke-${i}`}
                        position={[coord.x, coord.y, coord.z]}
                        name={name}
                        color={selectedPath.difficulty === 'Hard' ? '#ef4444' : '#fbbf24'}
                    />
                )
            })}
        </Suspense>
      </Canvas>
      
      {/* Overlay UI Controls could go here */}
      <div className="absolute top-4 right-4 bg-black/50 p-2 rounded text-white text-xs">
          Use Mouse to Rotate & Zoom
      </div>
    </div>
  );
};
