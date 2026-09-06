import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface SafetyNodeProps {
  position: [number, number, number];
  color: string;
  label: string;
  speed: number;
}

function SafetyNode({ position, color, speed }: SafetyNodeProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(t * speed) * 0.15;
    if (glowRef.current && 'opacity' in glowRef.current.material) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(t * speed * 1.5) * 0.05;
    }
  });

  return (
    <Float speed={speed * 0.8} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef} position={position}>
        {/* Hexagonal container */}
        <mesh>
          <cylinderGeometry args={[0.25, 0.25, 0.08, 6]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.25}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* Inner glow */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.1} />
        </mesh>
        {/* Connection line indicator dot */}
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      </group>
    </Float>
  );
}

function ConnectionLine({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) {
  const lineRef = useRef<THREE.Line>(null!);
  const particleRef = useRef<THREE.Mesh>(null!);

  const curve = useMemo(() => {
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    mid.y += 0.3;
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(30), [curve]);
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  useFrame((state) => {
    if (!particleRef.current) return;
    const t = state.clock.elapsedTime;
    const progress = (t * 0.3) % 1;
    const point = curve.getPoint(progress);
    particleRef.current.position.copy(point);
  });

  return (
    <group>
      <primitive object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.15 }))} ref={lineRef} />
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

export default function SafetyNodes() {
  const brainCenter = useMemo(() => new THREE.Vector3(0, 0.5, 0), []);

  const nodes: SafetyNodeProps[] = [
    { position: [-2.5, 1.2, -0.5], color: '#22d3ee', label: 'Safety Reports', speed: 1.3 },
    { position: [2.5, 1.2, -0.5], color: '#8b5cf6', label: 'NLP Analysis', speed: 1.1 },
    { position: [-2.5, -0.5, -0.5], color: '#f59e0b', label: 'Risk Detection', speed: 1.4 },
    { position: [2.5, -0.5, -0.5], color: '#22c55e', label: 'Prevention', speed: 1.2 },
  ];

  return (
    <group>
      {nodes.map((node, i) => (
        <group key={i}>
          <SafetyNode {...node} />
          <ConnectionLine
            start={new THREE.Vector3(...node.position)}
            end={brainCenter}
            color={node.color}
          />
        </group>
      ))}
    </group>
  );
}
