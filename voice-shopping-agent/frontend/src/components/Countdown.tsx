"use client";
import { useEffect, useState } from "react";

export default function Countdown({ to }: { to: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(to).getTime() - Date.now()));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [to]);
  if (left === null) return <span>-- : -- : -- : --</span>;
  const p = (n: number) => String(n).padStart(2, "0");
  const s = Math.floor(left / 1000);
  return <span>{p(Math.floor(s / 86400))} : {p(Math.floor(s / 3600) % 24)} : {p(Math.floor(s / 60) % 60)} : {p(s % 60)}</span>;
}
