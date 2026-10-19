"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/store/cart";
import { useOrders } from "@/store/orders";

type Msg = { role: "user" | "assistant"; content: string };
const HINTS = ["Help me choose a size", "Something for an evening out", "How is the fabric made?"];

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: "Good evening. Ask me about a piece, a fit, a fabric — or simply what to wear." }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speak, setSpeak] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const sessionId = useRef("");

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      window.speechSynthesis?.cancel();
    };
  }, []);

  function getSessionId() {
    if (!sessionId.current) {
      const stored = localStorage.getItem("velora-chat-session");
      sessionId.current = stored || crypto.randomUUID();
      localStorage.setItem("velora-chat-session", sessionId.current);
    }
    return sessionId.current;
  }

  async function send(content: string) {
    if (!content.trim() || busy) return;
    const next = [...msgs, { role: "user" as const, content }];
    setMsgs(next);
    setText("");
    setBusy(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ session_id: getSessionId(), message: content.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail ?? "The concierge could not answer just now.");
      if (typeof result.reply !== "string" || !result.reply.trim()) throw new Error("The concierge returned an empty reply.");
      setMsgs([...next, { role: "assistant", content: result.reply }]);
      const actions: { tool?: string }[] = Array.isArray(result.actions) ? result.actions : [];
      if (actions.some(({ tool }) => tool && ["add_to_cart", "update_cart_item", "remove_from_cart", "checkout"].includes(tool))) {
        void useCart.getState().refresh();
      }
      if (actions.some(({ tool }) => tool === "checkout")) void useOrders.getState().load();
      if (speak && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(result.reply);
        utterance.rate = 0.95;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      setMsgs([...next, { role: "assistant", content: error instanceof Error ? error.message : "The concierge could not answer just now." }]);
    } finally {
      setBusy(false);
    }
  }

  async function toggleMic() {
    if (listening) {
      recorder.current?.stop();
      return;
    }
    if (busy || transcribing) return;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setMsgs((previous) => [...previous, { role: "assistant", content: "Voice recording is not supported in this browser. Please use a recent Chrome, Edge, or Safari browser." }]);
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      chunks.current = [];
      const activeRecorder = new MediaRecorder(media);
      recorder.current = activeRecorder;
      activeRecorder.ondataavailable = (event) => {
        if (event.data.size) chunks.current.push(event.data);
      };
      activeRecorder.onstop = async () => {
        setListening(false);
        media.getTracks().forEach((track) => track.stop());
        stream.current = null;
        const audio = new Blob(chunks.current, { type: activeRecorder.mimeType || "audio/webm" });
        if (!audio.size) return;
        setTranscribing(true);
        try {
          const form = new FormData();
          const extension = audio.type.split("/")[1]?.split(";")[0] || "webm";
          form.append("audio", audio, `voice-message.${extension}`);
          const response = await fetch("/api/voice/transcribe", { method: "POST", body: form });
          const result = await response.json();
          if (!response.ok) throw new Error(result.detail ?? "Voice transcription failed.");
          if (typeof result.text !== "string" || !result.text.trim()) throw new Error("No speech was detected. Please try again.");
          setText(result.text);
          await send(result.text);
        } catch (error) {
          setMsgs((previous) => [...previous, { role: "assistant", content: error instanceof Error ? error.message : "Voice transcription failed." }]);
        } finally {
          setTranscribing(false);
        }
      };
      activeRecorder.start();
      setListening(true);
    } catch (error) {
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      setMsgs((previous) => [...previous, { role: "assistant", content: error instanceof Error ? error.message : "Microphone access was denied." }]);
    }
  }

  return (
    <>
      <button aria-label="Open concierge" onClick={() => setOpen(true)} style={{ position: "fixed", right: 24, bottom: 24, zIndex: 60, width: 56, height: 56, borderRadius: "50%", border: "1px solid var(--gold)", background: "var(--glass)", backdropFilter: "blur(16px)", color: "var(--gold)", fontSize: 20, cursor: "pointer" }}>✦</button>
      <AnimatePresence>
        {open && (
          <motion.aside role="dialog" aria-label="Concierge" className="glass chat-panel" initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "fixed", top: 20, right: 20, bottom: 20, width: 380, zIndex: 70, display: "flex", flexDirection: "column", padding: 24, boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div><div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 26, color: "var(--gold)" }}>The Concierge</div>
                <div style={{ fontSize: 11, letterSpacing: ".22em", color: "var(--dim)", marginTop: 4 }}>{listening ? "RECORDING…" : transcribing ? "TRANSCRIBING…" : busy ? "THINKING…" : "TEXT OR VOICE"}</div></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setSpeak(!speak)} aria-pressed={speak} aria-label="Read replies aloud" style={{ ...ghost, color: speak ? "var(--gold)" : "var(--mute)" }}>♪</button>
                <button onClick={() => { if (listening) recorder.current?.stop(); setOpen(false); }} aria-label="Close" style={ghost}>✕</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", margin: "20px 0", display: "grid", gap: 12, alignContent: "start" }}>
              {msgs.map((message, index) => (
                <div key={index} style={{ maxWidth: "88%", padding: "12px 16px", borderRadius: 16, fontSize: 14, lineHeight: 1.6, justifySelf: message.role === "user" ? "end" : "start", background: message.role === "user" ? "rgba(201,169,106,.16)" : "var(--glass)", color: "var(--ivory)" }}>{message.content}</div>
              ))}
              {busy && <div style={{ color: "var(--gold)", letterSpacing: ".4em" }}>···</div>}
              {msgs.length === 1 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{HINTS.map((hint) => <button key={hint} onClick={() => void send(hint)} style={{ ...ghost, width: "auto", height: "auto", borderRadius: 20, padding: "8px 14px", fontSize: 12 }}>{hint}</button>)}</div>}
              <div ref={end} />
            </div>
            {listening && <div aria-hidden style={{ display: "flex", gap: 4, justifyContent: "center", height: 28, marginBottom: 12 }}>{[0, 1, 2, 3, 4, 5, 6].map((index) => <motion.span key={index} animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.9, delay: index * 0.1 }} style={{ width: 3, height: 28, background: "var(--gold)", borderRadius: 2 }} />)}</div>}
            <form onSubmit={(event) => { event.preventDefault(); void send(text); }} style={{ display: "flex", gap: 10 }}>
              <input disabled={busy || listening || transcribing} value={text} onChange={(event) => setText(event.target.value)} aria-label="Message" placeholder="Ask anything…" style={{ flex: 1, height: 48, borderRadius: 24, border: "1px solid var(--glass-line)", background: "rgba(0,0,0,.25)", color: "var(--ivory)", padding: "0 18px", fontFamily: "inherit" }} />
              <button type="button" disabled={busy || transcribing} onClick={() => void toggleMic()} aria-label={listening ? "Stop recording" : "Record voice message"} aria-pressed={listening} style={{ ...ghost, width: 48, height: 48, borderColor: "var(--gold)", color: "var(--gold)", background: listening ? "rgba(201,169,106,.25)" : "none" }}>●</button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
const ghost = { width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--glass-line)", background: "none", color: "var(--mute)", cursor: "pointer", fontFamily: "inherit" } as const;
