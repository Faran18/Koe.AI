"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const ClothViewer = dynamic(() => import("./ClothViewer"), { ssr: false });
const ModelViewer = dynamic(() => import("./ModelViewer"), { ssr: false });

export default function ViewerStage({ image, id }: { image: string; id: string }) {
  const [model, setModel] = useState<string | null>(null);
  useEffect(() => { const u = `/models/${id}.glb`; fetch(u, { method: "HEAD" }).then((r) => r.ok && setModel(u)).catch(() => {}); }, [id]);
  const [flow, setFlow] = useState(1);
  return (
    <div style={{ position: "relative", height: "78vh" }}>
      <div style={{ position: "absolute", inset: "0 12%", borderRadius: "999px 999px 10px 10px", border: "1px solid rgba(201,169,106,.35)", background: "radial-gradient(circle at 50% 30%, #2d2518, transparent 80%)" }} />
      <div style={{ position: "absolute", inset: 0 }}>{model ? <ModelViewer url={model} /> : <ClothViewer key={image} src={image} flow={flow} />}</div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, letterSpacing: ".26em", color: "var(--dim)", textTransform: "uppercase" }}>
        <span>Drag · Scroll to zoom</span>
        <label style={{ visibility: model ? "hidden" : "visible" }}>Fabric flow <input type="range" min={0} max={2} step={0.1} value={flow} onChange={(e) => setFlow(+e.target.value)} style={{ accentColor: "#c9a96a", verticalAlign: "middle" }} /></label>
      </div>
    </div>
  );
}
