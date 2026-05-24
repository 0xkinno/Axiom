"use client";

import { ARC_TESTNET, AXIOM_ADDRESS, explorerAddr, shortAddr } from "@/lib/contract";

interface Props {
  wallet: string | null;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Header({ wallet, connecting, onConnect, onDisconnect }: Props) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(2,12,6,0.92)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, var(--green), var(--green3))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "#020c06",
            boxShadow: "0 0 20px rgba(0,255,136,0.4)",
            fontFamily: "Space Grotesk",
          }}>A</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", fontFamily: "Space Grotesk", letterSpacing: "0.05em" }}>
              AXIOM
            </div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "Space Mono", letterSpacing: "0.1em" }}>
              TRUSTLESS AGENT SETTLEMENT · ARC
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {[
            { label: "Explorer", href: `${ARC_TESTNET.explorer}/address/${AXIOM_ADDRESS}` },
            { label: "Docs", href: "https://github.com/0xkinno/axiom#readme" },
            { label: "GitHub", href: "https://github.com/0xkinno/axiom" },
            { label: "Protocol", href: "#protocol" },
          ].map(n => (
            <a key={n.label} href={n.href} target="_blank" rel="noreferrer"
              style={{
                fontSize: 13, fontWeight: 600, color: "var(--text-dim)",
                textDecoration: "none", fontFamily: "Space Grotesk",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--green)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}
            >
              {n.label}
            </a>
          ))}
        </nav>

        {/* Wallet */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 10, color: "var(--text-muted)",
            fontFamily: "Space Mono",
            background: "var(--panel)",
            border: "1px solid var(--border)",
            padding: "4px 10px", borderRadius: 6,
          }}>
            <div className="pulse-dot" style={{ width: 5, height: 5 }} />
            ARC TESTNET
          </div>

{/* Theme toggle */}
<button
  onClick={() => {
    const root = document.documentElement;
    const isLight = root.getAttribute("data-theme") === "light";
    root.setAttribute("data-theme", isLight ? "dark" : "light");
  }}
  style={{
    background: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    width: 32, height: 32,
    display: "flex", alignItems: "center",
    justifyContent: "center",
    cursor: "pointer", fontSize: 14,
  }}
  title="Toggle theme"
>
  ◑
</button>

          {wallet ? (
            <>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--panel)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "8px 14px",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--green)",
                  boxShadow: "0 0 8px rgba(0,255,136,0.6)",
                }} />
                <a href={explorerAddr(wallet)} target="_blank" rel="noreferrer"
                  className="addr" style={{ color: "var(--green)", textDecoration: "none" }}>
                  {shortAddr(wallet)}
                </a>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={onDisconnect}>
                Disconnect
              </button>
            </>
          ) : (
            <button className="btn btn-green" onClick={onConnect} disabled={connecting}>
              {connecting ? <><span className="spin" />Connecting...</> : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}