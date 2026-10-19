"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function Garment({ src, flow }: { src: string; flow: number }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const tex = useTexture(src);
  tex.colorSpace = THREE.SRGBColorSpace;
  const aspect = tex.image ? (tex.image as HTMLImageElement).width / (tex.image as HTMLImageElement).height : 1;
  const [w, h] = aspect >= 1 ? [2.6, 2.6 / aspect] : [2.6 * aspect, 2.6];
  const base = useMemo(() => new THREE.PlaneGeometry(w, h, 40, 40).attributes.position.array.slice(), [w, h]);
  useFrame(({ clock }) => {
    const pos = mesh.current.geometry.attributes.position;
    const t = clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1];
      const hang = (h / 2 - y) / h; // 0 at top (pinned) → 1 at hem (free)
      pos.setZ(i, Math.sin(x * 2.4 + t * 1.3) * 0.07 * hang * flow + Math.sin(y * 3 - t) * 0.03 * hang * flow);
    }
    pos.needsUpdate = true;
    mesh.current.geometry.computeVertexNormals();
  });
  return (
    <mesh ref={mesh}>
      <planeGeometry args={[w, h, 40, 40]} />
      <meshStandardMaterial map={tex} transparent alphaTest={0.05} side={THREE.DoubleSide} roughness={0.55} metalness={0.1} />
    </mesh>
  );
}

export default function ClothViewer({ src, flow = 1, interactive = true }: { src: string; flow?: number; interactive?: boolean }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.2], fov: 38 }} style={{ touchAction: "pan-y" }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#ffe6b8" />
      <pointLight position={[-4, -1, 2]} intensity={14} color="#c9a96a" />
      <Suspense fallback={null}><Garment src={src} flow={flow} /></Suspense>
      <OrbitControls enablePan={false} enableZoom={interactive} enableRotate={interactive} minDistance={2.4} maxDistance={6}
        autoRotate autoRotateSpeed={0.8} minAzimuthAngle={-0.9} maxAzimuthAngle={0.9} />
    </Canvas>
  );
}
