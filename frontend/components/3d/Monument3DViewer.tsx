"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  TextureLoader,
  Mesh,
  CylinderGeometry,
  MeshStandardMaterial,
  DoubleSide,
  BackSide,
} from "three";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";

// Monument data for each city
const cityMonuments: Record<string, { name: string; image: string; description: string }> = {
  dubai: {
    name: "Burj Khalifa",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200",
    description: "World's tallest building at 828m",
  },
  "abu-dhabi": {
    name: "Sheikh Zayed Grand Mosque",
    image: "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1200",
    description: "One of the world's largest mosques",
  },
  sharjah: {
    name: "Al Noor Mosque",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
    description: "Iconic illuminated mosque on Khalid Lagoon",
  },
  ajman: {
    name: "Ajman Museum",
    image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=1200",
    description: "Historic fort turned museum",
  },
  "ras-al-khaimah": {
    name: "Dhayah Fort",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200",
    description: "Historic hilltop fort with panoramic views",
  },
  fujairah: {
    name: "Fujairah Fort",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200",
    description: "Oldest fort in the UAE",
  },
  "umm-al-quwain": {
    name: "Umm Al Quwain Fort",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200",
    description: "Historic coastal fortification",
  },
};

interface PanoramicSphereProps {
  imageUrl: string;
  autoRotate: boolean;
}

function PanoramicSphere({ imageUrl, autoRotate }: PanoramicSphereProps) {
  const meshRef = useRef<Mesh>(null);
  const texture = useLoader(TextureLoader, imageUrl);

  useFrame((state) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 64, 64]} />
      <meshBasicMaterial map={texture} side={BackSide} />
    </mesh>
  );
}

interface Monument3DProps {
  imageUrl: string;
  autoRotate: boolean;
}

function Monument3D({ imageUrl, autoRotate }: Monument3DProps) {
  const cylinderRef = useRef<Mesh>(null);
  const texture = useLoader(TextureLoader, imageUrl);

  useFrame((state) => {
    if (cylinderRef.current && autoRotate) {
      cylinderRef.current.rotation.y += 0.003;
    }
  });

  // Create a cylinder with the monument image wrapped around it
  return (
    <group>
      {/* Main monument cylinder */}
      <mesh ref={cylinderRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[3, 3, 4, 64, 1, true]} />
        <meshStandardMaterial
          map={texture}
          side={DoubleSide}
          transparent={false}
        />
      </mesh>

      {/* Base platform */}
      <mesh position={[0, -2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4, 64]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Glowing ring */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.5, 4, 64]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

interface Monument3DViewerProps {
  cityId: string;
  className?: string;
}

export default function Monument3DViewer({
  cityId,
  className = "",
}: Monument3DViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewMode, setViewMode] = useState<"cylinder" | "panorama">("cylinder");

  const monument = cityMonuments[cityId] || cityMonuments.dubai;

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsLoaded(true); // Still show even if image fails
    img.src = monument.image;
  }, [monument.image]);

  return (
    <div className={`relative w-full h-full bg-gradient-to-b from-neutral-900 to-black ${className}`}>
      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Loading {monument.name}...</p>
            <p className="text-neutral-400 text-sm">Preparing 360° view</p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        className={`transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera
          makeDefault
          position={viewMode === "panorama" ? [0, 0, 0.1] : [0, 0, 8]}
          fov={viewMode === "panorama" ? 75 : 50}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#3b82f6" />
        <pointLight position={[10, -5, 10]} intensity={0.3} color="#8b5cf6" />

        <Suspense fallback={null}>
          {viewMode === "cylinder" ? (
            <Monument3D imageUrl={monument.image} autoRotate={autoRotate} />
          ) : (
            <PanoramicSphere imageUrl={monument.image} autoRotate={autoRotate} />
          )}
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
          minDistance={viewMode === "panorama" ? 0.1 : 4}
          maxDistance={viewMode === "panorama" ? 0.1 : 15}
          maxPolarAngle={viewMode === "panorama" ? Math.PI : Math.PI / 1.5}
          minPolarAngle={viewMode === "panorama" ? 0 : Math.PI / 4}
        />
      </Canvas>

      {/* Monument Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">{monument.name}</h3>
            <p className="text-neutral-300">{monument.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === "cylinder" ? "panorama" : "cylinder")}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg backdrop-blur-sm transition-colors"
            >
              {viewMode === "cylinder" ? "🌐 Panorama" : "🏛️ Monument"}
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg backdrop-blur-sm transition-colors"
            >
              {autoRotate ? "⏸️ Pause" : "▶️ Rotate"}
            </button>
          </div>
        </div>
      </div>

      {/* 3D Mode Badge */}
      <div className="absolute top-4 left-4 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium rounded-full backdrop-blur-sm">
        🏛️ 360° Monument View
      </div>

      {/* Controls Hint */}
      <div className="absolute top-4 right-20 text-xs text-white/60 bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
