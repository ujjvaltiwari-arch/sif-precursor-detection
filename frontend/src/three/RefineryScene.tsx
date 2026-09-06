import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function RefineryScene() {
  return (
    <group position={[0, -2, -8]}>
      <RefineryTowers />
      <PipelineNetwork />
      <RefineryLights />
      <AtmosphericHaze />
    </group>
  );
}

function RefineryTowers() {
  const towers = useMemo(() => [
    { pos: [-6, 0, -2] as [number, number, number], height: 5, radius: 0.3 },
    { pos: [-4.5, 0, -1] as [number, number, number], height: 6, radius: 0.25 },
    { pos: [-3, 0, -3] as [number, number, number], height: 4.5, radius: 0.35 },
    { pos: [5, 0, -2] as [number, number, number], height: 5.5, radius: 0.3 },
    { pos: [6.5, 0, -1] as [number, number, number], height: 4, radius: 0.28 },
    { pos: [4, 0, -4] as [number, number, number], height: 6.5, radius: 0.22 },
    { pos: [-1, 0, -5] as [number, number, number], height: 3.5, radius: 0.4 },
    { pos: [1, 0, -6] as [number, number, number], height: 4.2, radius: 0.32 },
  ], []);

  return (
    <group>
      {towers.map((t, i) => (
        <group key={i} position={t.pos}>
          {/* Main tower */}
          <mesh position={[0, t.height / 2, 0]}>
            <cylinderGeometry args={[t.radius * 0.7, t.radius, t.height, 8]} />
            <meshStandardMaterial
              color="#0c1929"
              metalness={0.6}
              roughness={0.4}
              transparent
              opacity={0.7}
            />
          </mesh>
          {/* Tower top */}
          <mesh position={[0, t.height, 0]}>
            <cylinderGeometry args={[t.radius * 1.2, t.radius * 0.7, 0.3, 8]} />
            <meshStandardMaterial
              color="#0f2338"
              metalness={0.5}
              roughness={0.5}
              transparent
              opacity={0.6}
            />
          </mesh>
          {/* Warning light */}
          <mesh position={[0, t.height + 0.3, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
          </mesh>
          <pointLight
            position={[0, t.height + 0.3, 0]}
            color="#ef4444"
            intensity={0.3}
            distance={2}
          />
        </group>
      ))}
    </group>
  );
}

function PipelineNetwork() {
  const lines = useMemo(() => {
    const paths: [THREE.Vector3, THREE.Vector3][] = [
      [new THREE.Vector3(-6, 1, -2), new THREE.Vector3(-4.5, 1.5, -1)],
      [new THREE.Vector3(-4.5, 1.5, -1), new THREE.Vector3(-3, 1.2, -3)],
      [new THREE.Vector3(5, 1.2, -2), new THREE.Vector3(6.5, 1, -1)],
      [new THREE.Vector3(5, 1.2, -2), new THREE.Vector3(4, 1.8, -4)],
      [new THREE.Vector3(-3, 1.2, -3), new THREE.Vector3(4, 1.8, -4)],
      [new THREE.Vector3(-1, 0.8, -5), new THREE.Vector3(1, 1, -6)],
    ];
    return paths;
  }, []);

  return (
    <group>
      {lines.map(([start, end], i) => {
        const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
        mid.y += 0.3;
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(20);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <primitive key={i} object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#1e3a5f', transparent: true, opacity: 0.3 }))} />
        );
      })}
    </group>
  );
}

function RefineryLights() {
  const lights = useMemo(() =>
    Array.from({ length: 20 }, () => ({
      pos: [
        (Math.random() - 0.5) * 14,
        Math.random() * 3 + 0.5,
        (Math.random() - 0.5) * 6 - 2,
      ] as [number, number, number],
      color: Math.random() > 0.7 ? '#f59e0b' : Math.random() > 0.5 ? '#22d3ee' : '#3b82f6',
      speed: Math.random() * 0.5 + 0.3,
      offset: Math.random() * Math.PI * 2,
    })), []);

  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    lights.forEach((light, i) => {
      dummy.position.set(...light.pos);
      const scale = 0.02 + Math.sin(t * light.speed + light.offset) * 0.01;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, lights.length]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
    </instancedMesh>
  );
}

function AtmosphericHaze() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current && 'opacity' in meshRef.current.material) {
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.03 + Math.sin(state.clock.elapsedTime * 0.2) * 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 2, -4]} rotation={[0, 0, 0]}>
      <planeGeometry args={[20, 8]} />
      <meshBasicMaterial
        color="#0b3550"
        transparent
        opacity={0.03}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
