"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import type React from "react";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface HelixRingsProps {
  levelsUp?: number;
  levelsDown?: number;
  stepY?: number;
  rotationStep?: number;
}

const HelixRings: React.FC<HelixRingsProps> = ({
  levelsUp = 12,
  levelsDown = 12,
  stepY = 0.75,
  rotationStep = Math.PI / 14,
}) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.004;
    }
  });

  const ringGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = 0.38;
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
    const depth = 11;
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 5,
      curveSegments: 72,
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -depth / 2);
    return geometry;
  }, []);

  const elements = useMemo(() => {
    const arr = [];
    for (let i = -levelsDown; i <= levelsUp; i++) {
      arr.push({
        id: `helix-ring-${i}`,
        y: i * stepY,
        rotation: i * rotationStep,
      });
    }
    return arr;
  }, [levelsUp, levelsDown, stepY, rotationStep]);

  return (
    <group scale={1} position={[5.5, 0, 0]} ref={groupRef} rotation={[0, 0, 0]}>
      {elements.map((el) => (
        <mesh
          key={el.id}
          geometry={ringGeometry}
          position={[0, el.y, 0]}
          rotation={[0, Math.PI / 2 + el.rotation, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#D4A574"
            metalness={0.75}
            roughness={0.4}
            clearcoat={0.1}
            clearcoatRoughness={0.2}
            reflectivity={0.2}
            iridescence={0.8}
            iridescenceIOR={1.6}
            iridescenceThicknessRange={[100, 500]}
          />
        </mesh>
      ))}
    </group>
  );
};

const HelixScene: React.FC = () => {
  return (
    <Canvas
      className="h-full w-full"
      orthographic
      shadows
      camera={{
        zoom: 65,
        position: [0, 0, 7],
        near: 0.1,
        far: 1000,
      }}
      gl={{ antialias: true }}
      style={{ background: "transparent" }}
    >
      <hemisphereLight color={"#fff5eb"} groundColor={"#f5ebe0"} intensity={2.2} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={2.5}
        castShadow
        color={"#ffeedd"}
      />
      <directionalLight position={[-5, -5, 5]} intensity={0.8} color={"#d4a574"} />
      <HelixRings />
    </Canvas>
  );
};

export default HelixScene;
