"use client";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <Center><primitive object={scene} /></Center>;
}

export default function ModelViewer({ url }: { url: string }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 35 }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} color="#ffe6b8" />
      <pointLight position={[-4, -1, 2]} intensity={14} color="#c9a96a" />
      <Suspense fallback={null}><Model url={url} /></Suspense>
      <OrbitControls enablePan={false} minDistance={1.5} maxDistance={8} autoRotate autoRotateSpeed={1.2} />
    </Canvas>
  );
}
