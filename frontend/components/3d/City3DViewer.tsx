"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader, Vector3, Color, Group } from "three";
import { OrbitControls, PerspectiveCamera, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

interface City3DImageProps {
  imageUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  isActive: boolean;
  onClick: () => void;
}

function City3DImage({
  imageUrl,
  position,
  rotation,
  scale,
  isActive,
  onClick,
}: City3DImageProps) {
  const groupRef = useRef<Group>(null);
  const texture = useLoader(TextureLoader, imageUrl);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y =
        position[1] + Math.sin(time + position[0]) * 0.1;
      if (isActive) {
        groupRef.current.rotation.y = rotation[1] + Math.sin(time * 0.5) * 0.1;
      }
      const targetScale = isActive ? scale * 1.1 : scale;
      groupRef.current.scale.lerp(
        new Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        onClick={onClick}
      >
        <mesh>
          <planeGeometry args={[2, 1.2, 16, 16]} />
          <meshStandardMaterial
            map={texture}
            transparent
            opacity={isActive ? 1 : 0.8}
            emissive={isActive ? new Color(0x111111) : new Color(0x000000)}
          />
        </mesh>
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[2.1, 1.3]} />
          <meshStandardMaterial
            color={isActive ? "#1e40af" : "#374151"}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
}

interface City3DViewerProps {
  images: string[];
  landmarks: string[];
  cityName: string;
  onImageChange?: (index: number) => void;
  className?: string;
}

export default function City3DViewer({
  images,
  landmarks,
  cityName,
  onImageChange,
  className = "",
}: City3DViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Suppress unused variable warning
  void landmarks;

  useEffect(() => {
    if (!isAutoRotating) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % images.length;
        onImageChange?.(next);
        return next;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length, isAutoRotating, onImageChange]);

  useEffect(() => {
    let loadedCount = 0;
    images.forEach((imageUrl) => {
      const img = new window.Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) setIsLoaded(true);
      };
      img.src = imageUrl;
    });
  }, [images]);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    onImageChange?.(index);
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 10000);
  };

  const getImagePosition = (index: number): [number, number, number] => {
    const angle = (index / images.length) * Math.PI * 2;
    const radius = 3;
    return [
      Math.cos(angle) * radius,
      (index - currentIndex) * 0.2,
      Math.sin(angle) * radius,
    ];
  };

  const getImageRotation = (index: number): [number, number, number] => {
    const angle = (index / images.length) * Math.PI * 2;
    return [0, -angle + Math.PI, 0];
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center z-10"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">
                Loading {cityName} in 3D
              </h3>
              <p className="text-neutral-400 text-sm">
                Preparing immersive experience...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Canvas
        className={`transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4f46e5" />

        <Suspense fallback={null}>
          {images.map((imageUrl, index) => (
            <City3DImage
              key={index}
              imageUrl={imageUrl}
              position={getImagePosition(index)}
              rotation={getImageRotation(index)}
              scale={index === currentIndex ? 1.2 : 1}
              isActive={index === currentIndex}
              onClick={() => handleImageClick(index)}
            />
          ))}
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={isAutoRotating}
          autoRotateSpeed={0.5}
          maxDistance={15}
          minDistance={3}
        />
      </Canvas>

      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="px-3 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
          🎭 3D Gallery Mode
        </div>
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className="px-3 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors"
        >
          {isAutoRotating ? "⏸️ Pause" : "▶️ Play"}
        </button>
      </div>

      <div className="absolute top-4 right-4 px-3 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleImageClick(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white w-6"
                : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-4 right-4 text-xs text-white/70 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
        Click images • Drag to orbit • Scroll to zoom
      </div>
    </div>
  );
}
