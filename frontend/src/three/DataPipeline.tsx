import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DataPipeline() {
  return (
    <group position={[0, 0, -3]}>
      <PipelinePaths />
      <FlowParticles />
    </group>
  );
}

function PipelinePaths() {
  const lines = useMemo(() => {
    const paths: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] = [
      // Left side pipelines
      { start: new THREE.Vector3(-5, -1, 0), end: new THREE.Vector3(-2.5, 1.2, -0.5), color: '#22d3ee' },
      { start: new THREE.Vector3(-5, 0, 1), end: new THREE.Vector3(-2.5, -0.5, -0.5), color: '#f59e0b' },
      // Right side pipelines
      { start: new THREE.Vector3(5, -1, 0), end: new THREE.Vector3(2.5, 1.2, -0.5), color: '#8b5cf6' },
      { start: new THREE.Vector3(5, 0, 1), end: new THREE.Vector3(2.5, -0.5, -0.5), color: '#22c55e' },
      // Bottom feeds
      { start: new THREE.Vector3(-3, -2, 2), end: new THREE.Vector3(0, -1.8, 0), color: '#3b82f6' },
      { start: new THREE.Vector3(3, -2, 2), end: new THREE.Vector3(0, -1.8, 0), color: '#3b82f6' },
    ];
    return paths;
  }, []);

  return (
    <group>
      {lines.map((line, i) => {
        const mid = new THREE.Vector3().lerpVectors(line.start, line.end, 0.5);
        mid.y += 0.2;
        const curve = new THREE.QuadraticBezierCurve3(line.start, mid, line.end);
        const points = curve.getPoints(40);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <primitive key={i} object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: line.color, transparent: true, opacity: 0.08 }))} />
        );
      })}
    </group>
  );
}

function FlowParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 30;

  const particles = useMemo(() => {
    const paths: THREE.QuadraticBezierCurve3[] = [];
    const startPoints = [
      new THREE.Vector3(-5, -1, 0),
      new THREE.Vector3(-5, 0, 1),
      new THREE.Vector3(5, -1, 0),
      new THREE.Vector3(5, 0, 1),
      new THREE.Vector3(-3, -2, 2),
      new THREE.Vector3(3, -2, 2),
    ];
    const endPoints = [
      new THREE.Vector3(-2.5, 1.2, -0.5),
      new THREE.Vector3(-2.5, -0.5, -0.5),
      new THREE.Vector3(2.5, 1.2, -0.5),
      new THREE.Vector3(2.5, -0.5, -0.5),
      new THREE.Vector3(0, -1.8, 0),
      new THREE.Vector3(0, -1.8, 0),
    ];

    for (let i = 0; i < count; i++) {
      const idx = i % startPoints.length;
      const start = startPoints[idx];
      const end = endPoints[idx];
      const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
      mid.y += 0.2;
      paths.push(new THREE.QuadraticBezierCurve3(start, mid, end));
    }

    return paths.map((curve, i) => ({
      curve,
      speed: 0.15 + Math.random() * 0.2,
      offset: Math.random(),
      color: i < 8 ? '#22d3ee' : i < 16 ? '#3b82f6' : i < 24 ? '#8b5cf6' : '#f59e0b',
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    particles.forEach((p, i) => {
      const progress = ((t * p.speed + p.offset) % 1);
      const point = p.curve.getPoint(progress);
      dummy.position.copy(point);
      const scale = 0.015 + Math.sin(t * 2 + p.offset) * 0.005;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.7} />
    </instancedMesh>
  );
}
