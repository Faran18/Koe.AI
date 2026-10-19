import type { Metadata } from "next";
import "@/styles/globals.css";
import Footer from "@/components/Footer";
import SyncGate from "@/components/SyncGate";
import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import ChatPanel from "@/components/ChatPanel";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "VELORA — Digital Fashion House",
  description: "Tailored streetwear cut for dusk.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Hanken+Grotesk:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body><SmoothScroll><SyncGate /><Nav />{children}<Footer /><CartDrawer /><ChatPanel /></SmoothScroll></body>
    </html>
  );
}
