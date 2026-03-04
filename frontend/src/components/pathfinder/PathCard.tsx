"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PathResult } from "@/types";
import { motion } from "framer-motion";
import { Footprints, Map, Zap } from "lucide-react";

interface PathCardProps {
  path: PathResult;
  onSelect: (path: PathResult) => void;
  selected?: boolean;
}

export const PathCard = ({ path, onSelect, selected }: PathCardProps) => {
  const isSelected = selected;
  
  const getIcon = () => {
    switch (path.type) {
      case 'Closest': return <Footprints className="h-5 w-5 text-green-500" />;
      case 'Longest': return <Map className="h-5 w-5 text-blue-500" />;
      case 'Balanced': return <Zap className="h-5 w-5 text-yellow-500" />;
      default: return <Map className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={() => onSelect(path)}
    >
      <Card className={`border-2 transition-colors ${isSelected ? 'border-pokemon-red bg-red-50 dark:bg-red-950/20' : 'border-transparent hover:border-pokemon-blue/50'}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {getIcon()}
            {path.type} Path
          </CardTitle>
          <span className="text-sm font-semibold text-muted-foreground">{path.distance}km</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Difficulty:</span>
                <span className={`font-medium ${
                    path.difficulty === 'Hard' ? 'text-red-500' : 
                    path.difficulty === 'Normal' ? 'text-yellow-600' : 'text-green-500'
                }`}>{path.difficulty}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Encounters:</span>
                <span className="font-medium">{path.encounters.length} Pokémon</span>
             </div>
             <div className="flex flex-wrap gap-1 mt-2">
                 {path.encounters.slice(0, 3).map((poke, i) => (
                     <span key={i} className="text-xs bg-secondary px-1.5 py-0.5 rounded-full">{poke}</span>
                 ))}
                 {path.encounters.length > 3 && (
                     <span className="text-xs text-muted-foreground px-1.5 py-0.5">+{path.encounters.length - 3} more</span>
                 )}
             </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
