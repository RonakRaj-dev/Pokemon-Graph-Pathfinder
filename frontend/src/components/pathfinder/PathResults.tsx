"use client"

import { PathResult } from "@/types";
import { motion } from "framer-motion";
import { PathCard } from "./PathCard";

interface PathResultsProps {
  paths: PathResult[];
  selectedPath: PathResult | null;
  onSelectPath: (path: PathResult) => void;
}

export const PathResults = ({ paths, selectedPath, onSelectPath }: PathResultsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-4xl">
      {paths.map((path, index) => (
        <motion.div
          key={path.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PathCard 
            path={path} 
            selected={selectedPath?.id === path.id}
            onSelect={onSelectPath}
          />
        </motion.div>
      ))}
    </div>
  );
};
