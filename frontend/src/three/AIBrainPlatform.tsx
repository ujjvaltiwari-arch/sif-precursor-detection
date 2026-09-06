import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function AIBrainPlatform() {
  return (
    <group position={[0, -1.8, 0]}>
      <PlatformRings />
      <EnergyBeam />
      <PlatformParticles />
    </group>
  );
}

function PlatformRings() {
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const ring3 = useRef<THREE.Mesh>(null!);
  const ring4 = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1.current && 'opacity' in ring1.current.material) {
      ring1.current.rotation.z = t * 0.1;
      (ring1.current.material as THREE.MeshBasicMaterial).opacity = 0.12 + Math.sin(t * 0.5) * 0.04;
    }
    if (ring2.current && 'opacity' in ring2.current.material) {
      ring2.current.rotation.z = -t * 0.07;
      (ring2.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(t * 0.4) * 0.03;
    }
    if (ring3.current && 'opacity' in ring3.current.material) {
      ring3.current.rotation.z = t * 0.05;
      (ring3.current.material as THREE.MeshBasicMaterial).opacity = 0.06 + Math.sin(t * 0.6) * 0.02;
    }
    if (ring4.current && 'opacity' in ring4.current.material) {
      ring4.current.rotation.z = -t * 0.03;
      (ring4.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + Math.sin(t * 0.3) * 0.02;
    }
  });

  return (
    <group>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.008, 16, 100]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.12} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.006, 16, 100]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.08} />
      </mesh>
      <mesh ref={ring3} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.1, 0.005, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.06} />
      </mesh>
      <mesh ref={ring4} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.4, 0.004, 16, 100]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

function EnergyBeam() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    if ('opacity' in meshRef.current.material) {
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(t * 0.8) * 0.03;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 0]}>
      <cylinderGeometry args={[0.02, 0.05, 2, 8]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.08} />
    </mesh>
  );
}

function PlatformParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 40;

  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 1.2 + Math.random() * 1.5,
      speed: Math.random() * 0.3 + 0.1,
      y: Math.random() * 0.5,
      ySpeed: Math.random() * 0.2 + 0.05,
    })), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    particles.forEach((p, i) => {
      const angle = p.angle + t * p.speed;
      const x = Math.cos(angle) * p.radius;
      const z = Math.sin(angle) * p.radius;
      const y = p.y + Math.sin(t * p.ySpeed + p.angle) * 0.3;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.015);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} />
    </instancedMesh>
  );
}
