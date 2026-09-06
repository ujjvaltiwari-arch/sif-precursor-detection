import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export default function AIBrain() {
  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.4}>
      <group position={[0, 0.5, 0]}>
        <BrainCore />
        <NeuralNetwork />
        <BrainGlow />
        <EnergyPulse />
      </group>
    </Float>
  );
}

function BrainCore() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.08;
      meshRef.current.rotation.x = Math.sin(t * 0.15) * 0.05;
    }
    if (innerRef.current && 'opacity' in innerRef.current.material) {
      innerRef.current.rotation.y = -t * 0.12;
      (innerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(t * 0.5) * 0.03;
    }
  });

  return (
    <group>
      {/* Outer brain - icosahedron with distortion */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshPhysicalMaterial
          color="#3b82f6"
          emissive="#1d4ed8"
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.7}
          transparent
          opacity={0.35}
          transmission={0.3}
          thickness={0.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      {/* Inner glow */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.08}
        />
      </mesh>
      {/* Core shield */}
      <ShieldSymbol />
    </group>
  );
}

function ShieldSymbol() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Shield shape using triangles */}
      <mesh position={[0, 0, 1.25]}>
        <coneGeometry args={[0.35, 0.5, 6]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 0, 1.25]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.25, 0.3, 6]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function NeuralNetwork() {
  const nodesRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { nodes } = useMemo(() => {
    const n: { pos: [number, number, number]; speed: number; offset: number }[] = [];
    const positions: THREE.Vector3[] = [];

    // Create nodes on the brain surface
    for (let i = 0; i < 60; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 1.2 + (Math.random() - 0.5) * 0.3;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      const pos: [number, number, number] = [x, y, z];
      n.push({ pos, speed: Math.random() * 0.5 + 0.3, offset: Math.random() * Math.PI * 2 });
      positions.push(new THREE.Vector3(x, y, z));
    }
    return { nodes: n, nodePositions: positions };
  }, []);

  useFrame((state) => {
    if (!nodesRef.current) return;
    const t = state.clock.elapsedTime;

    nodes.forEach((node, i) => {
      const pulse = Math.sin(t * node.speed + node.offset);
      const brightness = 0.3 + pulse * 0.3;
      dummy.position.set(...node.pos);
      const scale = 0.015 + brightness * 0.015;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      nodesRef.current.setMatrixAt(i, dummy.matrix);
    });
    nodesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={nodesRef} args={[undefined, undefined, nodes.length]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} />
      </instancedMesh>
    </group>
  );
}

function BrainGlow() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current && 'opacity' in meshRef.current.material) {
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.06 + Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.8, 32, 32]} />
      <meshBasicMaterial
        color="#3b82f6"
        transparent
        opacity={0.06}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function EnergyPulse() {
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime;
    const cycle = (t % 4) / 4;
    ringRef.current.scale.setScalar(0.3 + cycle * 2);
    if ('opacity' in ringRef.current.material) {
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - cycle) * 0.15;
    }
    ringRef.current.position.y = -1 + cycle * 3;
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.8, 0.008, 16, 64]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.15} />
    </mesh>
  );
}
