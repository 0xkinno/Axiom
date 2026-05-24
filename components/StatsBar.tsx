"use client";

import { AXIOM_ADDRESS, ARC_TESTNET, explorerAddr } from "@/lib/contract";

interface Props {
  stats: {
    totalJobs: string;
    totalAgents: string;
    totalSettled: string;
    totalVolume: string;
  };
}

export default function StatsBar({ stats }: Props) {
  const items = [
    { label: "Total Jobs", value: stats.totalJobs, icon: "◎", color: "var(--blue)" },
    { label: "Agents", value: stats.totalAgents, icon: "⬡", color: "var(--green)" },
    { label: "Settled", value: stats.totalSettled, icon: "✓", color: "var(--green)" },
    { label: "Volume (USDC)", value: "$" + stats.totalVolume, icon: "◆", color: "var(--amber)" },
  ];

  return (
    <div style={{
      borderBottom: "1px solid var(--border)",
      background: "rgba(4,15,8,0.8)",
      backdropFilter: "blur(10px)",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "stretch",
      }}>
        {items.map((item, i) => (
          <div key={item.label} style={{
            flex: 1, padding: "10px 20px",
            display: "flex", alignItems: "center", gap: 10,
            borderRight: i < items.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <span style={{ fontSize: 14, color: item.color }}>{item.icon}</span>
            <div>
              <div style={{
                fontSize: 20, fontWeight: 800,
                color: item.color, lineHeight: 1,
                fontFamily: "Space Grotesk",
              }}>{item.value}</div>
              <div style={{
                fontSize: 9, color: "var(--text-muted)",
                fontFamily: "Space Mono", letterSpacing: "0.08em",
                textTransform: "uppercase", marginTop: 2,
              }}>{item.label}</div>
            </div>
          </div>
        ))}

        {/* Contract */}
        <div style={{
          padding: "10px 20px",
          display: "flex", alignItems: "center", gap: 8,
          borderLeft: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "Space Mono" }}>CONTRACT</span>
          <a href={explorerAddr(AXIOM_ADDRESS)} target="_blank" rel="noreferrer"
            className="addr" style={{ color: "var(--green)", textDecoration: "none", fontSize: 10 }}>
            {AXIOM_ADDRESS.slice(0, 8)}...{AXIOM_ADDRESS.slice(-6)} ↗
          </a>
        </div>
      </div>
    </div>
  );
}