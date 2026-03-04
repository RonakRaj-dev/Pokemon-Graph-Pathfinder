"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Difficulty } from "@/types";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";

interface PathFinderFormProps {
  onSuggest: (destination: string, difficulty: Difficulty) => void;
  isLoading?: boolean;
}

export const PathFinderForm = ({ onSuggest, isLoading }: PathFinderFormProps) => {
  const [destination, setDestination] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Normal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) {
      onSuggest(destination, difficulty);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md z-10"
    >
      <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-pokemon-blue/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-pokemon-blue">Plan Your Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="destination"
                  placeholder="e.g. Cerulean City Gym"
                  className="pl-9"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['Easy', 'Normal', 'Hard'] as Difficulty[]).map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={difficulty === level ? "default" : "outline"}
                    className={
                        difficulty === level 
                        ? (level === 'Hard' ? "bg-red-500 hover:bg-red-600" : level === 'Easy' ? "bg-green-500 hover:bg-green-600" : "bg-pokemon-blue hover:bg-pokemon-blue/90")
                        : ""
                    }
                    onClick={() => setDifficulty(level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
                type="submit" 
                className="w-full font-bold text-lg" 
                variant="pokemon"
                disabled={isLoading}
            >
              {isLoading ? "Calculating Routes..." : "Find Paths"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
