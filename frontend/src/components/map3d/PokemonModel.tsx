"use client"

import { Billboard, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface PokemonModelProps {
  position: [number, number, number];
  name: string;
  color?: string;
}

export const PokemonModel = ({ position, name, color = "#FF0000" }: PokemonModelProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.5;
    }
  });

  return (
    <group position={position}>
        <Billboard
            follow={true}
            lockX={false}
            lockY={false}
            lockZ={false} // Lock the rotation on the z axis (default=false)
        >
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
            <Text
                position={[0, 1.2, 0]}
                fontSize={0.5}
                color="black"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="white"
            >
                {name}
            </Text>
        </Billboard>
    </group>
  );
};
