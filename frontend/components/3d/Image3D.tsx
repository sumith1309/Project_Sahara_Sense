"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader, Vector2, ShaderMaterial, Mesh } from "three";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

const vertexShader = `
  uniform float uTime;
  uniform float uDepth;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vElevation;
  
  void main() {
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    float elevation = sin(modelPosition.x * 2.0 + uTime * 0.5) * 0.1;
    elevation += sin(modelPosition.y * 3.0 + uTime * 0.3) * 0.05;
    float mouseInfluence = distance(uv, uMouse) * 2.0;
    elevation += (1.0 - mouseInfluence) * uDepth * 0.3;
    modelPosition.z += elevation;
    vElevation = elevation;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uAlpha;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying float vElevation;
  
  void main() {
    vec4 textureColor = texture2D(uTexture, vUv);
    vec3 depthColor = mix(textureColor.rgb, uColor, vElevation * 0.2);
    float shimmer = sin(vUv.x * 10.0 + uTime * 2.0) * 0.1 + 0.9;
    depthColor *= shimmer;
    gl_FragColor = vec4(depthColor, textureColor.a * uAlpha);
  }
`;

interface Image3DPlaneProps {
  imageUrl: string;
  mousePosition: Vector2;
}

function Image3DPlane({ imageUrl, mousePosition }: Image3DPlaneProps) {
  const meshRef = useRef<Mesh>(null);
  const texture = useLoader(TextureLoader, imageUrl);
  const materialRef = useRef<ShaderMaterial | null>(null);

  useEffect(() => {
    materialRef.current = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uDepth: { value: 0.3 },
        uAlpha: { value: 1.0 },
        uColor: { value: [0.2, 0.5, 1.0] },
        uMouse: { value: mousePosition },
      },
      transparent: true,
    });
  }, [texture, mousePosition]);

  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      const elapsedTime = state.clock.getElapsedTime();
      materialRef.current.uniforms.uTime.value = elapsedTime;
      materialRef.current.uniforms.uMouse.value = mousePosition;
      meshRef.current.rotation.y = Math.sin(elapsedTime * 0.2) * 0.1;
      meshRef.current.rotation.x = Math.cos(elapsedTime * 0.15) * 0.05;
    }
  });

  if (!materialRef.current) {
    materialRef.current = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uDepth: { value: 0.3 },
        uAlpha: { value: 1.0 },
        uColor: { value: [0.2, 0.5, 1.0] },
        uMouse: { value: mousePosition },
      },
      transparent: true,
    });
  }

  return (
    <mesh ref={meshRef} material={materialRef.current}>
      <planeGeometry args={[3, 2, 32, 32]} />
    </mesh>
  );
}

interface Image3DProps {
  imageUrl: string;
  className?: string;
  autoRotate?: boolean;
  enableControls?: boolean;
}

export default function Image3D({
  imageUrl,
  className = "",
  autoRotate = true,
  enableControls = true,
}: Image3DProps) {
  const [mousePosition, setMousePosition] = useState(new Vector2(0.5, 0.5));
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      setMousePosition(new Vector2(x, y));
    }
  };

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setIsLoaded(true);
    img.src = imageUrl;
  }, [imageUrl]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      onMouseMove={handleMouseMove}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center">
          <span className="text-neutral-500">Loading 3D view...</span>
        </div>
      )}

      <Canvas
        className={`transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={45} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color="#4f46e5" />

        <Suspense fallback={null}>
          <Image3DPlane imageUrl={imageUrl} mousePosition={mousePosition} />
        </Suspense>

        {enableControls && (
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            maxAzimuthAngle={Math.PI / 4}
            minAzimuthAngle={-Math.PI / 4}
          />
        )}
      </Canvas>

      <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
        🎭 3D Mode
      </div>

      {enableControls && (
        <div className="absolute bottom-4 right-4 text-xs text-white/70 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
          Drag to rotate • Scroll to zoom
        </div>
      )}
    </div>
  );
}
