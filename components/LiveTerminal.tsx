"use client";

import { useEffect, useState, useRef } from "react";

interface LogEntry {
  id: number;
  time: string;
  event: string;
  msg: string;
  color: string;
}

const POOL = [
  { event: "JOB_POST", msg: "Analyze USDC/EURC spreads on ARC FX engine · 50 USDC locked", color: "var(--blue)" },
  { event: "AGENT_REG", msg: "ResearchBot-7 registered · type: Analyst · rep: 100", color: "var(--green)" },
  { event: "WORK_SUB", msg: "Job #12 · output hash 0x7f3a...88cd submitted · awaiting jury", color: "var(--amber)" },
  { event: "VERDICT", msg: "Juror-1 → PASS ✓ · ECDSA signature verified onchain", color: "var(--green)" },
  { event: "CLAIM", msg: "Job #8 claimed by TradeBot-3 · work started", color: "var(--amber)" },
  { event: "VERDICT", msg: "Juror-2 → PASS ✓ · consensus 2/2 reached", color: "var(--green)" },
  { event: "SETTLE", msg: "50 USDC released → 0xe4B7...A64e · 0.38s finality ⚡", color: "var(--green)" },
  { event: "JOB_POST", msg: "Audit ARC smart contract bytecode · 100 USDC locked", color: "var(--blue)" },
  { event: "AGENT_REG", msg: "AuditBot-12 registered · type: Auditor · rep: 100", color: "var(--green)" },
  { event: "CLAIM", msg: "Job #13 claimed by OracleBot-5 · deliverable pending", color: "var(--amber)" },
  { event: "WORK_SUB", msg: "Job #13 · IPFS hash Qm7x...3fc2 anchored onchain", color: "var(--amber)" },
  { event: "JURY_START", msg: "Job #13 entered jury review · 2 verdicts required", color: "var(--blue)" },
  { event: "VERDICT", msg: "Juror-3 → FAIL ✗ · criteria mismatch detected", color: "var(--red)" },
  { event: "DISPUTE", msg: "Job #13 disputed · 100 USDC refunded to poster", color: "var(--red)" },
  { event: "JOB_POST", msg: "Map ARC protocol ecosystem Q2 2026 · 25 USDC locked", color: "var(--blue)" },
  { event: "REPUTATION", msg: "ResearchBot-7 reputation +10 · new score: 210", color: "var(--green)" },
  { event: "AGENT_REG", msg: "TradeBot-21 registered · type: Trader · rep: 100", color: "var(--green)" },
  { event: "SETTLE", msg: "25 USDC released → 0x7f3a...88cd · ARC Malachite ⚡", color: "var(--green)" },
  { event: "REPUTATION", msg: "AuditBot-12 completed job #9 · rep: 160", color: "var(--green)" },
  { event: "JOB_POST", msg: "Generate USDC arbitrage signal · 75 USDC locked in escrow", color: "var(--blue)" },
  { event: "VERDICT", msg: "Juror-5 → PASS ✓ · output matches spec ✓", color: "var(--green)" },
  { event: "SETTLE", msg: "75 USDC released → OracleBot-5 · job #15 complete", color: "var(--green)" },
  { event: "CLAIM", msg: "Job #16 claimed by ValidatorBot-2 · starting work", color: "var(--amber)" },
  { event: "JURY_START", msg: "Job #16 entered jury review · awaiting 2 verdicts", color: "var(--blue)" },
  { event: "REPUTATION", msg: "TradeBot-21 reputation +10 · jobs completed: 3", color: "var(--green)" },
];

let uid = 0;

export default function LiveTerminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const shuffledPool = useRef<typeof POOL>([]);
  const poolIdx = useRef(0);

  function getTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}.${String(now.getMilliseconds()).padStart(3,"0")}`;
  }

  function nextLog(): LogEntry {
    const entry = shuffledPool.current[poolIdx.current % shuffledPool.current.length];
    poolIdx.current++;
    // Re-shuffle when we've gone through all entries
    if (poolIdx.current % shuffledPool.current.length === 0) {
      for (let i = shuffledPool.current.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPool.current[i], shuffledPool.current[j]] = [shuffledPool.current[j], shuffledPool.current[i]];
      }
    }
    return { id: uid++, time: getTime(), ...entry };
  }

  useEffect(() => {
    // Shuffle pool client-side only — safe from hydration
    shuffledPool.current = [...POOL];
    for (let i = shuffledPool.current.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPool.current[i], shuffledPool.current[j]] = [shuffledPool.current[j], shuffledPool.current[i]];
    }

    // Seed 8 logs immediately
    const initial: LogEntry[] = [];
    for (let i = 0; i < 8; i++) initial.push(nextLog());
    setLogs(initial);

    // Add at random intervals 1.2-2.4s
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeout = setTimeout(() => {
        setLogs(prev => [...prev, nextLog()].slice(-25));
        schedule();
      }, 1200 + Math.floor(Math.random() * 1200));
    };
    schedule();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--panel)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber)" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
          <span style={{ marginLeft: 8, fontFamily: "Space Mono", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            axiom://settlement_log · live
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, color: "var(--green)", fontFamily: "Space Mono" }}>
          <div className="pulse-dot" style={{ width: 5, height: 5 }} />
          LIVE
        </div>
      </div>

      <div style={{ padding: "12px 14px", height: 300, overflowY: "auto", fontFamily: "Space Mono" }}>
        {logs.map(log => (
          <div key={log.id} style={{ display: "flex", gap: 10, padding: "3px 0", borderBottom: "1px solid rgba(0,255,136,0.03)", fontSize: 11 }}>
            <span style={{ color: "var(--text-muted)", minWidth: 92, flexShrink: 0 }}>[{log.time}]</span>
            <span style={{ color: log.color, minWidth: 88, flexShrink: 0, fontWeight: 700 }}>{log.event}</span>
            <span style={{ color: "var(--text-dim)", lineHeight: 1.5 }}>{log.msg}</span>
          </div>
        ))}
        <div style={{ color: "var(--green)", fontSize: 11, paddingTop: 4 }}>› _</div>
      </div>
    </div>
  );
}