import { useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function HiggsParticles({ count = 300 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null!);
  const mousePos = useRef({ x: 0, y: 0 });
  const alive = useRef(true);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      const mix = Math.random();
      col[i * 3] = 0.23 + mix * 0.2;
      col[i * 3 + 1] = 0.51 + mix * 0.2;
      col[i * 3 + 2] = 0.96;
    }
    return { positions: pos, colors: col };
  }, [count]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  useEffect(() => {
    alive.current = true;
    window.addEventListener('pointermove', handlePointerMove);
    return () => { alive.current = false; window.removeEventListener('pointermove', handlePointerMove); };
  }, [handlePointerMove]);

  useFrame((state) => {
    if (!alive.current || !mesh.current) return;
    const t = state.clock.elapsedTime;
    const geo = mesh.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += Math.sin(t * 0.3 + i * 0.1) * 0.001;
      arr[i3] += Math.cos(t * 0.2 + i * 0.05) * 0.0005;
    }
    posAttr.needsUpdate = true;

    mesh.current.rotation.y = t * 0.01 + mousePos.current.x * 0.1;
    mesh.current.rotation.x = mousePos.current.y * 0.05;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function EnergyField() {
  const ring = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useFrame((state) => {
    if (!alive.current) return;
    const t = state.clock.elapsedTime;
    if (ring.current && 'opacity' in ring.current.material) {
      ring.current.rotation.z = t * 0.05;
      ring.current.rotation.x = Math.sin(t * 0.1) * 0.3;
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + Math.sin(t * 0.5) * 0.02;
    }
    if (ring2.current && 'opacity' in ring2.current.material) {
      ring2.current.rotation.z = -t * 0.03;
      ring2.current.rotation.y = Math.cos(t * 0.1) * 0.4;
      (ring2.current.material as THREE.MeshBasicMaterial).opacity = 0.03 + Math.cos(t * 0.4) * 0.015;
    }
  });

  return (
    <>
      <mesh ref={ring} position={[0, 0, -4]}>
        <torusGeometry args={[3, 0.01, 16, 100]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.04} />
      </mesh>
      <mesh ref={ring2} position={[0, 0, -5]}>
        <torusGeometry args={[4, 0.008, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.03} />
      </mesh>
    </>
  );
}

function FloatingOrbs() {
  const group = useRef<THREE.Group>(null!);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useFrame((state) => {
    if (!alive.current || !group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  const orbs = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      pos: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, -3 - Math.random() * 3] as [number, number, number],
      scale: Math.random() * 0.15 + 0.05,
      color: i % 2 === 0 ? '#3b82f6' : '#8b5cf6',
    })), []);

  return (
    <group ref={group}>
      {orbs.map((orb, i) => (
        <Float key={i} speed={1 + Math.random()} floatIntensity={0.5}>
          <mesh position={orb.pos}>
            <sphereGeometry args={[orb.scale, 16, 16]} />
            <meshBasicMaterial color={orb.color} transparent opacity={0.15} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function HiggsScene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <HiggsParticles count={300} />
      <EnergyField />
      <FloatingOrbs />
      <Stars radius={40} depth={40} count={800} factor={2} saturation={0} fade speed={0.2} />
    </>
  );
}

export default function HiggsFieldBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(139,92,246,0.04) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(59,130,246,0.03) 0%, transparent 50%)',
      }} />
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <HiggsScene />
      </Canvas>
    </div>
  );
}
