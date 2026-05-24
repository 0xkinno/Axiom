"use client";

import { AXIOM_ADDRESS, ARC_TESTNET, explorerAddr } from "@/lib/contract";

export default function Footer() {
  const contracts = [
    { name: "AxiomCore", addr: AXIOM_ADDRESS },
    { name: "JobEscrow", addr: "0x" + "7047D67Ef69F40F9340Fd97EDF79276458238cfe" },
    { name: "JuryRegistry", addr: "0x" + "4E7B06D78965594eB5EF5414c357ca21E1554491" },
    { name: "ReputationNFT", addr: "0x" + "9D0ED40615845ee6134F475AcCF35e0412CA1EdF" },
  ];

  const resources = [
    { label: "Docs ↗", href: "https://github.com/0xkinno/axiom#readme" },
    { label: "ARC Explorer ↗", href: `${ARC_TESTNET.explorer}/address/${AXIOM_ADDRESS}` },
    { label: "GitHub ↗", href: "https://github.com/0xkinno/axiom" },
    { label: "ARC Faucet ↗", href: "https://faucet.circle.com" },
    { label: "ARC Docs ↗", href: "https://docs.arc.io" },
    { label: "x402 Protocol ↗", href: "https://x402.org" },
  ];

  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      background: "var(--surface)",
      marginTop: 80, position: "relative", zIndex: 1,
    }}>
      {/* Top glow line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.3), transparent)",
      }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 32px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 48, marginBottom: 48,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, var(--green), var(--green3))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 900, color: "#020c06",
              }}>A</div>
              <span style={{ fontSize: 20, fontWeight: 900, fontFamily: "Space Grotesk", color: "var(--text)", letterSpacing: "0.05em" }}>
                AXIOM
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 280, marginBottom: 20 }}>
              The trustless settlement protocol for AI agent work. Payment releases only when cryptographic proof confirms the output is correct.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {["ARC Chain", "x402", "USDC Native", "EVM"].map(t => (
                <span key={t} className="badge badge-green" style={{ fontSize: 9 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Contracts */}
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
              fontFamily: "Space Mono", letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 16,
            }}>
              TESTNET CONTRACTS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {contracts.map(c => (
                <div key={c.name}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", marginBottom: 2 }}>{c.name}</div>
                  <a href={explorerAddr(c.addr)} target="_blank" rel="noreferrer"
                    className="addr"
                    style={{ color: "var(--green)", textDecoration: "none", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    {c.addr.slice(0, 8)}...{c.addr.slice(-6)} ↗
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
              fontFamily: "Space Mono", letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 16,
            }}>
              RESOURCES
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {resources.map(r => (
                <a key={r.label} href={r.href} target="_blank" rel="noreferrer"
                  style={{
                    fontSize: 13, color: "var(--text-dim)", textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--green)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                >
                  {r.label}
                </a>
              ))}
            </div>
          </div>

          {/* Network */}
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
              fontFamily: "Space Mono", letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 16,
            }}>
              NETWORK
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { k: "Chain", v: "ARC Testnet" },
                { k: "Chain ID", v: "5042002" },
                { k: "Gas Token", v: "USDC" },
                { k: "Finality", v: "~0.5s" },
                { k: "RPC", v: "rpc.testnet.arc.network" },
                { k: "Explorer", v: "testnet.arcscan.app" },
              ].map(n => (
                <div key={n.k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "Space Mono" }}>{n.k}</span>
                  <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "Space Mono" }}>{n.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 24,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--text-muted)" }}>
            AXIOM · Built for Agora Agents Hackathon 2026 · Powered by ARC + Circle
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="https://github.com/0xkinno/axiom" target="_blank" rel="noreferrer"
              style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--green)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
            >GitHub ↗</a>
            <a href={`${ARC_TESTNET.explorer}/address/${AXIOM_ADDRESS}`} target="_blank" rel="noreferrer"
              style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--green)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
            >ARC Explorer ↗</a>
            <a href="https://x.com/0xkinno" target="_blank" rel="noreferrer"
              style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--text-muted)", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--green)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
            >X / Twitter ↗</a>
          </div>
        </div>
      </div>
    </footer>
  );
}