import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function MouseFollow() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => { alive.current = false; window.removeEventListener('mousemove', handler); };
  }, []);

  useFrame(() => {
    if (!alive.current || !camera) return;
    camera.position.x += (mouse.current.x * 0.4 - camera.position.x) * 0.02;
    camera.position.y += (mouse.current.y * 0.25 + 0.3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ─── AI Brain Particles ─── */
function BrainParticles({ count = 2200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const mouse = useRef({ x: 0, y: 0 });
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const h = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', h, { passive: true });
    return () => { alive.current = false; window.removeEventListener('mousemove', h); };
  }, []);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Brain hemisphere shape
      const side = Math.random() > 0.5 ? 1 : -1;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI;
      const r = 0.6 + Math.random() * 0.55;
      const x = side * r * Math.sin(phi) * Math.cos(theta) * 0.85;
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.9;
      const z = r * Math.cos(phi) * 0.7;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      const mix = Math.random();
      if (mix > 0.7) {
        col[i * 3] = 0.13; col[i * 3 + 1] = 0.83; col[i * 3 + 2] = 0.93;
      } else if (mix > 0.35) {
        col[i * 3] = 0.23; col[i * 3 + 1] = 0.51; col[i * 3 + 2] = 0.96;
      } else {
        col[i * 3] = 0.55; col[i * 3 + 1] = 0.36; col[i * 3 + 2] = 0.96;
      }
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((state) => {
    if (!ref.current || !alive.current) return;
    const t = state.clock.elapsedTime;
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += Math.sin(t * 0.25 + i * 0.05) * 0.0003;
      arr[i3] += Math.cos(t * 0.18 + i * 0.03) * 0.0002;
    }
    posAttr.needsUpdate = true;
    ref.current.rotation.y = t * 0.04 + mouse.current.x * 0.08;
    ref.current.rotation.x = mouse.current.y * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} vertexColors transparent opacity={0.85} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ─── Neural Connections ─── */
function NeuralConnections() {
  const ref = useRef<THREE.LineSegments>(null!);
  const alive = useRef(true);

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const { geometry } = useMemo(() => {
    const nodes: [number, number, number][] = [];
    for (let i = 0; i < 120; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI;
      const r = 0.5 + Math.random() * 0.5;
      nodes.push([
        side * r * Math.sin(phi) * Math.cos(theta) * 0.85,
        r * Math.sin(phi) * Math.sin(theta) * 0.9,
        r * Math.cos(phi) * 0.7,
      ]);
    }
    const linePositions: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const dz = nodes[i][2] - nodes[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 0.5) {
          linePositions.push(...nodes[i], ...nodes[j]);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    return { geometry: geo };
  }, []);

  useFrame((state) => {
    if (!ref.current || !alive.current) return;
    if ('opacity' in ref.current.material) {
      (ref.current.material as THREE.LineBasicMaterial).opacity = 0.06 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
    }
  });

  return (
    <primitive ref={ref} object={new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: '#3b82f6', transparent: true, opacity: 0.06 }))} />
  );
}

/* ─── AI Core ─── */
function AICore() {
  const ref = useRef<THREE.Mesh>(null!);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  useFrame((state) => {
    if (!ref.current || !alive.current) return;
    const t = state.clock.elapsedTime;
    const s = 0.08 + Math.sin(t * 1.5) * 0.02;
    ref.current.scale.setScalar(s);
    if ('opacity' in ref.current.material) {
      (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.7 + Math.sin(t * 1.5) * 0.2;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} />
    </mesh>
  );
}

/* ─── Holographic Rings ─── */
function HoloRings() {
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  const r3 = useRef<THREE.Mesh>(null!);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  useFrame((state) => {
    if (!alive.current) return;
    const t = state.clock.elapsedTime;
    if (r1.current && 'opacity' in r1.current.material) { r1.current.rotation.z = t * 0.08; (r1.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(t * 0.4) * 0.03; }
    if (r2.current && 'opacity' in r2.current.material) { r2.current.rotation.z = -t * 0.06; (r2.current.material as THREE.MeshBasicMaterial).opacity = 0.05 + Math.sin(t * 0.3) * 0.02; }
    if (r3.current && 'opacity' in r3.current.material) { r3.current.rotation.z = t * 0.04; (r3.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + Math.sin(t * 0.5) * 0.015; }
  });

  return (
    <>
      <mesh ref={r1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.004, 16, 100]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.08} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[1.85, 0.003, 16, 100]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.05} />
      </mesh>
      <mesh ref={r3} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.1, 0.003, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.04} />
      </mesh>
    </>
  );
}

/* ─── Data Flow Particles ─── */
function DataFlow() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const particles = useMemo(() =>
    Array.from({ length: 30 }, () => ({
      startAngle: Math.random() * Math.PI * 2,
      startRadius: 2.5 + Math.random() * 1.5,
      speed: 0.15 + Math.random() * 0.2,
      y: (Math.random() - 0.5) * 2,
      yOffset: Math.random() * Math.PI * 2,
    })), []);

  useFrame((state) => {
    if (!ref.current || !alive.current) return;
    const t = state.clock.elapsedTime;
    particles.forEach((p, i) => {
      const progress = ((t * p.speed) % 1);
      const r = p.startRadius * (1 - progress);
      const angle = p.startAngle + t * 0.1;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = p.y + Math.sin(t * 0.5 + p.yOffset) * 0.3;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.015 * (1 - progress * 0.5));
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 30]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.7} />
    </instancedMesh>
  );
}

/* ─── Floating Labels (2D overlay rendered in 3D) ─── */
function FloatingLabels() {
  const labels = [
    { pos: [1.8, 1.2, 0] as [number, number, number], text: 'SIF PRECURSOR', color: '#f59e0b' },
    { pos: [-1.8, 0.8, 0] as [number, number, number], text: 'CONFIDENCE 94.7%', color: '#22d3ee' },
    { pos: [1.5, -1, 0] as [number, number, number], text: 'RISK ANALYSIS', color: '#ef4444' },
    { pos: [-1.5, -0.8, 0] as [number, number, number], text: 'SAFETY SIGNAL', color: '#22c55e' },
  ];

  return (
    <group>
      {labels.map((l, i) => (
        <Float key={i} speed={1 + i * 0.15} rotationIntensity={0} floatIntensity={0.3}>
          <group position={l.pos}>
            <mesh>
              <planeGeometry args={[0.9, 0.18]} />
              <meshBasicMaterial color={l.color} transparent opacity={0.06} />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  );
}

/* ─── Platform Base ─── */
function Platform() {
  const ref = useRef<THREE.Mesh>(null!);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useFrame((state) => {
    if (!ref.current || !alive.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.05;
  });

  return (
    <group position={[0, -1.5, 0]}>
      <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.006, 16, 80]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.1} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.7, 0.004, 16, 80]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

/* ─── Scene ─── */
function BrainScene() {
  return (
    <>
      <MouseFollow />
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.25} color="#e2e8f0" />
      <pointLight position={[-3, 2, 2]} intensity={0.35} color="#3b82f6" distance={12} />
      <pointLight position={[3, 2, 2]} intensity={0.25} color="#8b5cf6" distance={12} />
      <pointLight position={[0, -1, 3]} intensity={0.15} color="#22d3ee" distance={8} />

      <BrainParticles count={2200} />
      <NeuralConnections />
      <AICore />
      <HoloRings />
      <DataFlow />
      <FloatingLabels />
      <Platform />
    </>
  );
}

export default function HeroScene() {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) setOk(false);
    } catch { setOk(false); }
  }, []);

  if (!ok) return (
    <div className="w-full h-full" style={{
      background: 'radial-gradient(ellipse at 50% 40%, rgba(59,130,246,0.15) 0%, transparent 60%)',
    }} />
  );

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <BrainScene />
      </Canvas>
    </div>
  );
}
