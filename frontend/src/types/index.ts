export type Difficulty = 'Easy' | 'Normal' | 'Hard';

export interface Location {
  id: string;
  name: string;
  type: 'city' | 'gym' | 'landmark' | 'route';
  coordinates: { x: number; y: number; z: number };
}

export interface PathResult {
  id: string;
  name: string;
  type: 'Closest' | 'Longest' | 'Balanced';
  distance: number; // in km or steps
  difficulty: Difficulty;
  encounters: string[]; // List of Pokemon names
  coordinates: { x: number; y: number; z: number }[];
}

export interface Pokemon {
  id: number;
  name: string;
  type: string[];
  sprite: string;
}
