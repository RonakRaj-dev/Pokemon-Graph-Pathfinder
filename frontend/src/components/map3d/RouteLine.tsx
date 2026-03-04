"use client"

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface RouteLineProps {
  points: [number, number, number][];
  color: string;
  active: boolean;
}

export const RouteLine = ({ points, color, active }: RouteLineProps) => {
  const materialRef = useRef<any>(null);

  // Animate the dash offset to create a moving effect
  useFrame((state, delta) => {
    if (materialRef.current && active) {
      if (materialRef.current.dashOffset !== undefined) {
         materialRef.current.dashOffset -= delta * 10;
      }
    }
  });

  if (!points || points.length < 2) return null;

  // Convert points to Vector3 for Drei Line
  const vectorPoints = points.map(p => new THREE.Vector3(...p));

  return (
    <Line
      points={vectorPoints}
      color={color}
      lineWidth={active ? 5 : 2}
      dashed={true}
      dashScale={active ? 50 : 0} // Only animate/show dashes if active? Or different style
      dashSize={1}
      gapSize={active ? 0.5 : 0}
      opacity={active ? 1 : 0.3}
      transparent
    />
  );
};
