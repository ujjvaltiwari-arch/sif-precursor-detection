import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function HeroParticles() {
  const meshRef = useRef<THREE.Points>(null!);
  const count = 200;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
      const mix = Math.random();
      if (mix > 0.7) {
        col[i * 3] = 0.13; col[i * 3 + 1] = 0.83; col[i * 3 + 2] = 0.93;
      } else if (mix > 0.4) {
        col[i * 3] = 0.23; col[i * 3 + 1] = 0.51; col[i * 3 + 2] = 0.96;
      } else {
        col[i * 3] = 0.55; col[i * 3 + 1] = 0.36; col[i * 3 + 2] = 0.96;
      }
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += Math.sin(t * 0.2 + i * 0.1) * 0.0008;
      arr[i3] += Math.cos(t * 0.15 + i * 0.05) * 0.0004;
    }
    posAttr.needsUpdate = true;
    meshRef.current.rotation.y = t * 0.005;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
