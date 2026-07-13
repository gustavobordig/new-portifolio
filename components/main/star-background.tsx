"use client";

import { Points, PointMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { inSphere } from "maath/random";
import { useMemo, useRef, Suspense } from "react";
import type { Points as PointsType } from "three";

const STAR_COUNT = 1500;

export const StarBackground = () => {
  const ref = useRef<PointsType | null>(null);
  const positions = useMemo(() => {
    const buffer = new Float32Array(STAR_COUNT * 3);
    inSphere(buffer, { radius: 1.2 });

    // Garante que nenhum valor inválido quebre o bounding sphere
    for (let i = 0; i < buffer.length; i++) {
      if (!Number.isFinite(buffer[i])) {
        buffer[i] = 0;
      }
    }

    return buffer;
  }, []);

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        stride={3}
        positions={positions}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color="#fff"
          size={0.002}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

export const StarsCanvas = () => (
  <div className="w-full h-auto fixed inset-0 -z-10">
    <Canvas camera={{ position: [0, 0, 1] }}>
      <Suspense fallback={null}>
        <StarBackground />
      </Suspense>
    </Canvas>
  </div>
);
