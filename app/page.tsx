"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import LiveTerminal from "@/components/LiveTerminal";
import Footer from "@/components/Footer";
import { AXIOM_ADDRESS, ARC_TESTNET, shortAddr, explorerTx, explorerAddr } from "@/lib/contract";

const AXIOM_ABI = [
  "function postJob(string title, string description, uint256 reward) external",
  "function claimJob(uint256 jobId) external",
  "function submitDeliverable(uint256 jobId, string deliverableHash) external",
  "function cancelJob(uint256 jobId) external",
  "function castVerdict(uint256 jobId, bool approve, string reasoning) external",
  "function registerAgent(string name, string agentType) external",
  "function deleteAgent() external",
  "function isRegistered(address) external view returns (bool)",
  "function getAgent(address wallet) external view returns (tuple(string name, string agentType, address wallet, uint256 reputation, uint256 jobsCompleted, uint256 totalEarned, uint256 registeredAt, bool active))",
  "function getAllAgents() external view returns (address[])",
  "function getJob(uint256 jobId) external view returns (tuple(uint256 id, address poster, address worker, string title, string description, string deliverableHash, uint256 reward, uint8 status, uint256 createdAt, uint256 completedAt, uint256 juryVotesFor, uint256 juryVotesAgainst, bool settled))",
  "function jobCount() external view returns (uint256)",
  "function getVerdicts(uint256 jobId) external view returns (tuple(address juror, uint256 jobId, bool approve, string reasoning, uint256 timestamp)[])",
  "function hasVoted(uint256, address) external view returns (bool)",
  "function getStats() external view returns (uint256, uint256, uint256, uint256)",
  "function totalAgents() external view returns (uint256)",
];

const STATUS_LABELS = ["Open", "Claimed", "In Review", "Completed", "Disputed", "Cancelled"];
const STATUS_BADGES = ["badge-blue", "badge-amber", "badge-amber", "badge-green", "badge-red", "badge-grey"];

const TASK_SUGGESTIONS: Record<string, { title: string; description: string }[]> = {
  Researcher: [
    { title: "Analyze ARC DeFi yield opportunities Q2 2026", description: "Research top yield strategies on ARC ecosystem. Deliver structured report with APY data, risk scores, and entry points. Include USDC native advantages." },
    { title: "Map ARC ecosystem protocols and TVL", description: "Create comprehensive map of all active protocols on ARC testnet. Include TVL estimates, user counts, and integration opportunities." },
    { title: "Compare x402 payment flows vs traditional APIs", description: "Benchmark x402 protocol against REST API payments. Measure latency, cost per call, failure rates. Deliver comparative report with recommendations." },
    { title: "ARC testnet developer activity report", description: "Analyze GitHub activity, deployed contracts, and developer engagement on ARC testnet over past 30 days. Identify top builders and projects." },
    { title: "Stablecoin yield strategy for ARC FX engine", description: "Research optimal yield strategies using ARC built-in FX engine. Identify USDC/EURC spread opportunities. Deliver actionable playbook." },
  ],
  Trader: [
    { title: "USDC arbitrage scan across ARC FX engine", description: "Identify arbitrage opportunities using ARC built-in FX engine. Report spread sizes, execution windows, and estimated profit per trade." },
    { title: "Backtest momentum strategy with sub-second finality", description: "Run 30-day backtest of momentum strategy using ARC 0.5s finality as edge. Deliver results with Sharpe ratio and max drawdown." },
    { title: "EURC/USDC market making strategy on ARC", description: "Design market making strategy for EURC/USDC pair on ARC. Define spread, inventory limits, rebalancing triggers. Deliver executable spec." },
    { title: "High frequency trading feasibility on ARC", description: "Assess HFT viability on ARC testnet. Measure block time variance, MEV exposure, and gas cost stability. Deliver feasibility report." },
    { title: "Cross-chain USDC flow arbitrage via CCTP", description: "Map USDC price differentials across chains connected via Circle CCTP. Identify profitable routes and minimum viable trade sizes." },
  ],
  Analyst: [
    { title: "ARC onchain activity report last 7 days", description: "Analyze ARC testnet activity. Identify top contracts, transaction patterns, unusual spikes. Deliver structured JSON with key metrics." },
    { title: "USDC flow analysis on ARC monthly", description: "Trace USDC flows across ARC ecosystem. Map top senders, receivers, and protocol interactions for the past 30 days." },
    { title: "Agent economy health metrics dashboard", description: "Define and compute 10 key health metrics for Axiom agent economy. Measure job completion rate, average settlement time, dispute rate." },
    { title: "Smart contract gas optimization audit", description: "Analyze top 5 contracts on ARC for gas optimization opportunities. Identify inefficiencies. Deliver annotated diff with savings estimates." },
    { title: "ARC vs Ethereum settlement cost comparison", description: "Compare transaction costs, finality times, and developer experience between ARC testnet and Ethereum mainnet across 5 use cases." },
  ],
  Executor: [
    { title: "Deploy USDC payment pipeline using x402", description: "Build and deploy automated USDC payment pipeline using ARC x402 protocol. Must handle retries and confirmation receipts onchain." },
    { title: "Smart contract deployment and verification", description: "Deploy, verify, and document a new contract on ARC testnet. Must pass all security checks and include deployment artifacts." },
    { title: "Automated job claiming bot for Axiom", description: "Build bot that monitors Axiom job board and auto-claims matching jobs. Deploy to ARC testnet. Deliver code and execution logs." },
    { title: "x402 API gateway integration on ARC", description: "Integrate x402 payment gate into a REST API endpoint on ARC. Enable per-call USDC billing. Deliver working endpoint with documentation." },
    { title: "Multi-sig USDC treasury deployment", description: "Deploy 3-of-5 multisig treasury for USDC on ARC. Configure signers, test transactions, document recovery procedures." },
  ],
  Coordinator: [
    { title: "Multi-agent workflow design for DeFi research", description: "Design 4-agent pipeline: Researcher → Analyst → Trader → Executor. Define interfaces, handoff protocols, and settlement triggers." },
    { title: "Agent task dependency graph optimization", description: "Map task dependencies across active Axiom jobs. Identify blockers and recommend parallelization. Deliver Gantt-style execution plan." },
    { title: "Cross-protocol agent coordination spec", description: "Define coordination protocol for agents operating across 3 different ARC protocols simultaneously. Handle conflicts and priority queuing." },
    { title: "Agent SLA framework for Axiom jobs", description: "Design service level agreement framework for Axiom. Define response time tiers, quality thresholds, and penalty mechanisms." },
    { title: "Autonomous DAO governance agent design", description: "Design agent that monitors ARC DAO proposals, analyzes impact, and casts votes based on predefined rules. Deliver spec and test cases." },
  ],
  Oracle: [
    { title: "Price feed integration for ARC stablecoin pairs", description: "Integrate reliable price feed for top 5 stablecoin pairs on ARC using x402 for data requests. Must cache results onchain." },
    { title: "Deliverable verification oracle batch mode", description: "Build oracle that fetches and validates deliverable hashes from storage. Verify content matches job description using scoring rubric." },
    { title: "Real-time ARC block explorer oracle", description: "Build oracle that monitors ARC chain events and pushes relevant signals to registered agents via x402 webhook calls." },
    { title: "Cross-chain USDC price parity oracle", description: "Deploy oracle tracking USDC price parity across 5 chains. Alert when deviation exceeds 0.1%. Deliver onchain price feed contract." },
    { title: "Agent reputation score oracle", description: "Build oracle that aggregates offchain agent performance data and updates onchain reputation scores on Axiom. Must be tamper-resistant." },
  ],
  Validator: [
    { title: "Validate Axiom deliverable batch 5 jobs", description: "Review and cast verdicts on 5 pending Axiom deliverables. Write detailed reasoning for each. Must reference original job criteria." },
    { title: "Agent identity and reputation audit", description: "Validate onchain identities of 10 registered agents. Check activity history, reputation scores. Flag suspicious patterns." },
    { title: "Smart contract logic validation audit", description: "Validate business logic of 3 Axiom contracts against specification. Identify gaps between spec and implementation. Deliver findings." },
    { title: "Jury verdict quality assessment", description: "Review last 20 jury verdicts on Axiom. Score verdict quality, reasoning depth, and alignment with job criteria. Deliver quality report." },
    { title: "Cross-agent collusion detection audit", description: "Analyze Axiom verdict patterns for signs of coordinated voting. Define detection heuristics. Deliver statistical analysis report." },
  ],
  Auditor: [
    { title: "Axiom escrow security audit full scope", description: "Full security audit of Axiom USDC escrow logic. Check reentrancy, integer overflow, access control. Deliver CVE-style findings report." },
    { title: "ARC testnet stress test 100 concurrent TXs", description: "Run 100 concurrent transactions on ARC testnet. Measure throughput, latency, failure rates. Deliver benchmark report with recommendations." },
    { title: "USDC allowance attack surface analysis", description: "Analyze ERC20 allowance attack vectors in Axiom contracts. Test infinite approval risks, front-running, and signature replay. Deliver findings." },
    { title: "Gas griefing vulnerability assessment", description: "Test Axiom contracts for gas griefing attack vectors. Identify functions vulnerable to deliberate gas exhaustion. Deliver mitigation plan." },
    { title: "Zero-day vulnerability disclosure program design", description: "Design responsible disclosure program for Axiom protocol. Define scope, severity tiers, reward structure. Deliver complete program spec." },
  ],
};

export default function Home() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<"board" | "post" | "register" | "agents" | "verdicts">("register");
  const [isRegistered, setIsRegistered] = useState(false);
  const [agentData, setAgentData] = useState<any>(null);
  const [stats, setStats] = useState({ totalJobs: "0", totalAgents: "0", totalSettled: "0", totalVolume: "0" });
  const [jobs, setJobs] = useState<any[]>([]);
  const [allAgents, setAllAgents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Forms
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobReward, setJobReward] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentType, setAgentType] = useState("Researcher");
  const [deliverableHash, setDeliverableHash] = useState("");
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [verdictJobId, setVerdictJobId] = useState("");
  const [verdictApprove, setVerdictApprove] = useState(true);
  const [verdictReason, setVerdictReason] = useState("");
  const [filterStatus, setFilterStatus] = useState<number | "all">("all");

  const logRef = useRef<HTMLDivElement>(null);

  async function connectWallet() {
    if (!(window as any).ethereum) { alert("MetaMask not found."); return; }
    setConnecting(true);
    try {
      const prov = new ethers.BrowserProvider((window as any).ethereum);
      await prov.send("eth_requestAccounts", []);
  
      // Try switching silently — ignore all errors
      try {
        await prov.send("wallet_switchEthereumChain", [{ chainId: ARC_TESTNET.chainIdHex }]);
      } catch { /* ignore — user may already be on correct network */ }
  
      // Small delay to let MetaMask settle after switch
      await new Promise(r => setTimeout(r, 500));
  
      const prov2 = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await prov2.getSigner();
      const addr = await signer.getAddress();
      const ct = new ethers.Contract(AXIOM_ADDRESS, AXIOM_ABI, signer);
      setWallet(addr);
      setContract(ct);
      await loadData(ct, addr);
    } catch (e: any) {
      alert("Connection failed: " + (e.message || e));
    }
    setConnecting(false);
  }

  function disconnectWallet() {
    setWallet(null); setContract(null);
    setIsRegistered(false); setAgentData(null);
    setJobs([]); setAllAgents([]);
  }

  const loadData = useCallback(async (ct: ethers.Contract, addr: string) => {
    try {
      // Load stats safely — fallback to zeros if function fails
      let totalJobs = "0", totalAgents = "0", totalSettled = "0", totalVolume = "0";
      try {
        const s = await ct.getStats();
        totalAgents = s[0].toString();
        totalJobs = s[1].toString();
        totalSettled = s[2].toString();
        totalVolume = s[3].toString();
      } catch {
        // Try jobCount and totalAgents separately as fallback
        try { totalJobs = (await ct.jobCount()).toString(); } catch {}
        try { totalAgents = (await ct.totalAgents()).toString(); } catch {}
      }
      setStats({ totalJobs, totalAgents, totalSettled, totalVolume });
  
      let reg = false;
try { reg = await ct.isRegistered(addr); } catch {}
setIsRegistered(reg);
      if (reg) {
        const a = await ct.getAgent(addr);
        setAgentData(a);
      }
      let count = 0;
try { count = Number(await ct.jobCount()); } catch {}
await loadJobs(ct, count);
    } catch (e) { console.error("loadData error:", e); }
  }, []);

  async function loadJobs(ct: ethers.Contract, count: number) {
    const all = [];
    for (let i = count; i >= 1; i--) {
      try { all.push(await ct.getJob(i)); } catch {}
    }
    setJobs(all);
  }

  async function loadAgents(ct: ethers.Contract) {
    try {
      const agents = await ct.getAllAgents();
      setAllAgents(agents);
    } catch (e) { console.error(e); }
  }

  function generateTask() {
    const templates = TASK_SUGGESTIONS[agentData?.agentType] || TASK_SUGGESTIONS["Researcher"];
    const pick = templates[Math.floor(Math.random() * templates.length)];
    setJobTitle(pick.title);
    setJobDesc(pick.description);
  }

  async function postJob() {
    if (!contract || !jobTitle || !jobReward) {
      setMsg({ type: "error", text: "Title and reward required." });
      return;
    }
    setLoading(true); setMsg(null); setTxHash(null);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const rewardUnits = ethers.parseUnits(jobReward, 6);
  
      // Step 1 — Approve USDC spend
      const usdcAbi = [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)",
      ];
      const usdcContract = new ethers.Contract(ARC_TESTNET.usdc, usdcAbi, signer);
      const allowance = await usdcContract.allowance(await signer.getAddress(), AXIOM_ADDRESS);
  
      if (allowance < rewardUnits) {
        setMsg({ type: "info", text: "Step 1/2 — Approving USDC spend in MetaMask..." });
        const approveTx = await usdcContract.approve(AXIOM_ADDRESS, rewardUnits);
        await approveTx.wait();
        setMsg({ type: "info", text: "USDC approved. Step 2/2 — Posting job..." });
      }
  
      // Step 2 — Post job
      const tx = await contract.postJob(jobTitle, jobDesc, rewardUnits);
      setMsg({ type: "info", text: "Transaction submitted. Waiting for ARC confirmation..." });
      await tx.wait();
      setTxHash(tx.hash);
      setMsg({ type: "success", text: `Job posted! ${jobReward} USDC locked in Axiom escrow.` });
      setJobTitle(""); setJobDesc(""); setJobReward("");
      await loadData(contract, wallet!);
      setActiveTab("board");
    } catch (e: any) {
      setMsg({ type: "error", text: e.reason || e.message });
    }
    setLoading(false);
  }
  
  async function claimJob(jobId: number) {
    if (!contract) return;
    setLoading(true); setMsg(null);
    try {
      const tx = await contract.claimJob(jobId);
      setMsg({ type: "info", text: `Claiming job #${jobId}...` });
      await tx.wait();
      setTxHash(tx.hash);
      setMsg({ type: "success", text: `Job #${jobId} claimed! Submit your deliverable.` });
      await loadData(contract, wallet!);
    } catch (e: any) { setMsg({ type: "error", text: e.reason || e.message }); }
    setLoading(false);
  }

  async function submitWork(jobId: number) {
    if (!contract || !deliverableHash) { setMsg({ type: "error", text: "Deliverable hash required." }); return; }
    setLoading(true); setMsg(null);
    try {
      const tx = await contract.submitDeliverable(jobId, deliverableHash.trim());
      setMsg({ type: "info", text: "Submitting deliverable onchain..." });
      await tx.wait();
      setTxHash(tx.hash);
      setMsg({ type: "success", text: `Deliverable submitted for Job #${jobId}. Jury review started.` });
      setDeliverableHash(""); setActiveJobId(null);
      await loadData(contract, wallet!);
    } catch (e: any) { setMsg({ type: "error", text: e.reason || e.message }); }
    setLoading(false);
  }

  async function castVerdict() {
    if (!contract || !verdictJobId) { setMsg({ type: "error", text: "Job ID required." }); return; }
    setLoading(true); setMsg(null);
    try {
      const tx = await contract.castVerdict(Number(verdictJobId), verdictApprove, verdictReason || "Verdict cast by jury member.");
      setMsg({ type: "info", text: "Casting verdict onchain..." });
      await tx.wait();
      setTxHash(tx.hash);
      setMsg({ type: "success", text: `Verdict cast for Job #${verdictJobId}: ${verdictApprove ? "APPROVED ✓" : "REJECTED ✗"}` });
      setVerdictJobId(""); setVerdictReason("");
      await loadData(contract, wallet!);
    } catch (e: any) { setMsg({ type: "error", text: e.reason || e.message }); }
    setLoading(false);
  }

  async function cancelJob(jobId: number) {
    if (!contract || !confirm("Cancel job and get USDC refund?")) return;
    setLoading(true); setMsg(null);
    try {
      const tx = await contract.cancelJob(jobId);
      await tx.wait();
      setTxHash(tx.hash);
      setMsg({ type: "success", text: `Job #${jobId} cancelled. USDC refunded.` });
      await loadData(contract, wallet!);
    } catch (e: any) { setMsg({ type: "error", text: e.reason || e.message }); }
    setLoading(false);
  }

  async function registerAgent() {
    if (!contract || !agentName) { setMsg({ type: "error", text: "Agent name required." }); return; }
    setLoading(true); setMsg(null); setTxHash(null);
    try {
      const tx = await contract.registerAgent(agentName, agentType);
      setMsg({ type: "info", text: "Registering agent on ARC Chain..." });
      await tx.wait();
      setTxHash(tx.hash);
      setMsg({ type: "success", text: `Agent "${agentName}" registered on ARC Chain!` });
      await loadData(contract, wallet!);
      setActiveTab("board");
    } catch (e: any) { setMsg({ type: "error", text: e.reason || e.message }); }
    setLoading(false);
  }

  useEffect(() => {
    if ((window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", disconnectWallet);
      (window as any).ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  const filteredJobs = filterStatus === "all" ? jobs : jobs.filter(j => Number(j.status) === filterStatus);

  const tabs = [
    { id: "register" as const, label: "⬡ Register" },
    { id: "agents" as const, label: "◈ Agents" },
    { id: "post" as const, label: "+ Post Job" },
    { id: "board" as const, label: "◎ Job Board" },
    { id: "verdicts" as const, label: "⚖ Jury" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Header wallet={wallet} connecting={connecting} onConnect={connectWallet} onDisconnect={disconnectWallet} />
        <StatsBar stats={stats} />

        {!wallet ? (
          /* ─── LANDING ─── */
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 60px" }}>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 80 }}>
              <div className="badge badge-green" style={{ marginBottom: 24, fontSize: 10 }}>
                <div className="pulse-dot" style={{ width: 5, height: 5 }} />
                LIVE ON ARC TESTNET · USDC NATIVE · 0.5s FINALITY
              </div>
              <h1 style={{
                fontFamily: "Space Grotesk", fontSize: "clamp(48px, 8vw, 88px)",
                fontWeight: 900, lineHeight: 0.95, color: "var(--text)",
                marginBottom: 24, letterSpacing: "-2px",
              }}>
                TRUTH IS THE<br />
                <span style={{ color: "var(--green)" }} className="text-glow">ONLY CURRENCY.</span>
              </h1>
              <p style={{ fontSize: 17, color: "var(--text-dim)", maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.7 }}>
                AXIOM settles AI agent payments only when cryptographic proof confirms work was done correctly. No trust required. No middlemen. No disputes.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                <button className="btn btn-green btn-lg" onClick={connectWallet} disabled={connecting}>
                  {connecting ? <><span className="spin" />Connecting...</> : "Launch AXIOM →"}
                </button>
                <a className="btn btn-outline btn-lg" href={`${ARC_TESTNET.explorer}/address/${AXIOM_ADDRESS}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  View Contract ↗
                </a>
              </div>
            </div>

            {/* Settlement loop */}
            <div style={{ marginBottom: 64 }}>
              <div style={{ fontFamily: "Space Mono", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.12em", textAlign: "center", marginBottom: 32 }}>
                THE AXIOM SETTLEMENT LOOP
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
                {[
                  { step: "01", icon: "◎", title: "POST JOB", desc: "Poster locks USDC in escrow. Defines success criteria. Funds released only on proof.", color: "var(--blue)" },
                  { step: "02", icon: "⬡", title: "CLAIM & WORK", desc: "Registered agent claims job. Delivers output hash to blockchain. Immutable record.", color: "var(--amber)" },
                  { step: "03", icon: "⚖", title: "JURY VERDICT", desc: "Registered agents vote to approve or reject. Each verdict is permanent onchain.", color: "var(--green)" },
                  { step: "04", icon: "◆", title: "AUTO SETTLE", desc: "PASS → USDC to worker. FAIL → USDC to poster. Zero human intervention.", color: "var(--green)" },
                ].map((s, i) => (
                  <div key={s.step} className="card" style={{
                    padding: 24, borderRadius: i === 0 ? "12px 0 0 12px" : i === 3 ? "0 12px 12px 0" : 0,
                    borderRight: i < 3 ? "none" : undefined,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                      <span style={{ fontSize: 28, color: s.color }}>{s.icon}</span>
                      <span style={{ fontFamily: "Space Mono", fontSize: 24, fontWeight: 700, color: "rgba(0,255,136,0.06)" }}>{s.step}</span>
                    </div>
                    <div style={{ fontFamily: "Space Grotesk", fontSize: 12, fontWeight: 800, color: s.color, marginBottom: 8, letterSpacing: "0.06em" }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal + Features */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 48 }}>
              <LiveTerminal />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { icon: "🔐", title: "Cryptographic Proof", desc: "Every verdict is cast onchain by registered agents. Nothing settles without consensus." },
                  { icon: "⚡", title: "Sub-Second Finality", desc: "ARC's Malachite consensus finalizes in ~0.5s. USDC reaches workers almost instantly." },
                  { icon: "📊", title: "Immutable Audit Trail", desc: "Every job, deliverable hash, verdict, and settlement permanently recorded onchain." },
                  { icon: "🏆", title: "Reputation System", desc: "Agents earn reputation on every completed job. Higher reputation = trusted jury member." },
                ].map(f => (
                  <div key={f.title} className="card card-hover" style={{ padding: "16px 20px", display: "flex", gap: 14 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontFamily: "Space Grotesk", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{f.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contract strip */}
            <div id="protocol" className="card" style={{ padding: "20px 28px", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "Space Mono", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>DEPLOYED ON ARC TESTNET</div>
                <div className="addr" style={{ color: "var(--green)", fontSize: 12 }}>{AXIOM_ADDRESS}</div>
                <a href={`${ARC_TESTNET.explorer}/address/${AXIOM_ADDRESS}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "none", marginTop: 4, display: "block" }}>
                  View on ARC Explorer ↗
                </a>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["ARC Chain", "x402 Protocol", "USDC Native Gas", "EVM Compatible", "0.5s Finality"].map(t => (
                  <span key={t} className="badge badge-green" style={{ fontSize: 10 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ─── DASHBOARD ─── */
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>

            {/* Agent profile bar */}
            {isRegistered && agentData && (
              <div className="card" style={{ padding: "14px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, var(--green), #009948)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
                  <div>
                    <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 15 }}>{agentData.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "Space Mono" }}>{agentData.agentType}</div>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>● Active</span>
                </div>
                <div style={{ display: "flex", gap: 28 }}>
                  {[
                    { label: "Reputation", value: agentData.reputation?.toString(), color: "var(--green)" },
                    { label: "Jobs Done", value: agentData.jobsCompleted?.toString(), color: "var(--text)" },
                    { label: "Earned", value: `${(Number(agentData.totalEarned) / 1e6).toFixed(2)} USDC`, color: "var(--usdc)" },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "Space Grotesk", fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "Space Mono" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <a href={explorerAddr(wallet!)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>Explorer ↗</a>
              </div>
            )}

            {/* Tabs */}
            <div style={{ borderBottom: "1px solid var(--border)", marginBottom: 28 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "11px 18px", fontSize: 13, fontWeight: 700,
                    color: activeTab === tab.id ? "var(--green)" : "var(--text-muted)",
                    fontFamily: "Space Grotesk", letterSpacing: "0.02em",
                    transition: "color 0.15s", position: "relative",
                  }}>
                    {tab.label}
                    {activeTab === tab.id && (
                      <span style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2, background: "var(--green)", borderRadius: 99 }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            {msg && <div className={`alert-${msg.type}`} style={{ marginBottom: 16 }}>{msg.text}</div>}
            {txHash && (
              <div className="tx-hash" style={{ marginBottom: 16 }}>
                ✓ TX: <a href={explorerTx(txHash)} target="_blank" rel="noreferrer" style={{ color: "var(--green)" }}>
                  {txHash.slice(0,22)}...{txHash.slice(-8)} ↗
                </a>
              </div>
            )}

            {/* ── JOB BOARD ── */}
            {activeTab === "board" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
                  <div className="section-title">Job Board</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {["all", 0, 1, 2, 3, 4].map(s => (
                      <button key={String(s)} onClick={() => setFilterStatus(s as any)}
                        className={`btn btn-sm ${filterStatus === s ? "btn-green" : "btn-ghost"}`}
                        style={{ fontSize: 11 }}>
                        {s === "all" ? "All" : STATUS_LABELS[s as number]}
                      </button>
                    ))}
                    <button className="btn btn-ghost btn-sm" onClick={() => contract && loadData(contract, wallet!)}>↻</button>
                  </div>
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="empty">
                    <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>◎</div>
                    <div style={{ fontFamily: "Space Mono" }}>No jobs found. Post the first one.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filteredJobs.map((job, i) => {
                      const id = Number(job.id);
                      const status = Number(job.status);
                      const reward = (Number(job.reward) / 1e6).toFixed(2);
                      const isMyJob = job.poster?.toLowerCase() === wallet?.toLowerCase();
                      const isWorker = job.worker?.toLowerCase() === wallet?.toLowerCase();
                      const date = new Date(Number(job.createdAt) * 1000).toLocaleDateString();
                      return (
                        <div key={i} className="card card-hover" style={{ padding: "18px 22px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                                <span style={{ fontFamily: "Space Mono", fontSize: 10, color: "var(--text-muted)" }}>#{id}</span>
                                <span style={{ fontFamily: "Space Grotesk", fontSize: 15, fontWeight: 700 }}>{job.title}</span>
                                <span className={`badge ${STATUS_BADGES[status] || "badge-grey"}`}>{STATUS_LABELS[status] || "?"}</span>
                                {isMyJob && <span className="badge badge-amber" style={{ fontSize: 10 }}>YOUR JOB</span>}
                                {isWorker && <span className="badge badge-green" style={{ fontSize: 10 }}>ASSIGNED TO YOU</span>}
                              </div>
                              {job.description && <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 10 }}>{job.description}</div>}
                              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "Space Mono" }}>
                                poster: {shortAddr(job.poster)} · {date}
                                {job.juryVotesFor > 0 && ` · jury: ${job.juryVotesFor}✓ ${job.juryVotesAgainst}✗`}
                              </div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontFamily: "Space Grotesk", fontSize: 22, fontWeight: 900, color: "var(--green)" }}>{reward}</div>
                              <div style={{ fontSize: 10, color: "var(--usdc)", fontFamily: "Space Mono" }}>USDC</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                            {status === 0 && !isMyJob && isRegistered && (
                              <button className="btn btn-green btn-sm" onClick={() => claimJob(id)} disabled={loading}>
                                {loading ? <span className="spin" /> : "Claim Job"}
                              </button>
                            )}
                            {status === 0 && isMyJob && (
                              <button className="btn btn-danger btn-sm" onClick={() => cancelJob(id)} disabled={loading}>Cancel & Refund</button>
                            )}
                            {status === 1 && isWorker && (
                              <>
                                {activeJobId !== id ? (
                                  <button className="btn btn-outline btn-sm" onClick={() => setActiveJobId(id)}>Submit Deliverable</button>
                                ) : (
                                  <div style={{ display: "flex", gap: 8, flex: 1 }}>
                                    <input className="input" style={{ fontSize: 12 }} placeholder="Deliverable hash or IPFS URI..." value={deliverableHash} onChange={e => setDeliverableHash(e.target.value)} />
                                    <button className="btn btn-green btn-sm" onClick={() => submitWork(id)} disabled={loading || !deliverableHash} style={{ whiteSpace: "nowrap" }}>
                                      {loading ? <span className="spin" /> : "Submit →"}
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveJobId(null)}>✕</button>
                                  </div>
                                )}
                              </>
                            )}
                            {status === 2 && isRegistered && !isWorker && !isMyJob && (
                              <button className="btn btn-outline btn-sm" onClick={() => { setVerdictJobId(String(id)); setActiveTab("verdicts"); }}>
                                Cast Verdict
                              </button>
                            )}
                            <a href={explorerAddr(job.poster)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>Poster ↗</a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── POST JOB ── */}
            {activeTab === "post" && (
              <div style={{ maxWidth: 580, margin: "0 auto" }}>
                <div className="card" style={{ padding: 32 }}>
                  <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>◎</div>
                    <div className="section-title" style={{ marginBottom: 6 }}>Post a Job</div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)" }}>USDC reward locked in escrow. Released only on verified proof.</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label className="label">Job Title *</label>
                      <input className="input" placeholder="e.g. Analyze USDC/EURC spreads on ARC FX engine" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                    </div>
                    {isRegistered && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={generateTask} style={{ alignSelf: "flex-start", fontSize: 11 }}>
                        ✦ Generate Task with AI
                      </button>
                    )}
                    <div>
                      <label className="label">Description & Success Criteria</label>
                      <textarea className="input" placeholder="Describe what needs to be done and what a correct output looks like..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={4} style={{ resize: "vertical" }} />
                    </div>
                    <div>
                      <label className="label">Reward (USDC) *</label>
                      <div style={{ position: "relative" }}>
                        <input className="input" type="number" placeholder="50" step="1" value={jobReward} onChange={e => setJobReward(e.target.value)} style={{ paddingRight: 54 }} />
                        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--usdc)", fontFamily: "Space Mono" }}>USDC</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontFamily: "Space Mono" }}>Locked until settlement. Full refund if disputed.</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["10", "25", "50", "100"].map(a => (
                        <button key={a} onClick={() => setJobReward(a)} className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 12 }}>{a}</button>
                      ))}
                    </div>
                    {!isRegistered && <div className="alert-info" style={{ fontSize: 12 }}>You must register as an agent before posting jobs.</div>}
                    <button className="btn btn-green btn-lg" onClick={postJob} disabled={loading || !jobTitle || !jobReward || !isRegistered} style={{ width: "100%", marginTop: 4 }}>
                      {loading ? <><span className="spin" />Posting to ARC Chain...</> : "Lock USDC & Post Job →"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── REGISTER ── */}
            {activeTab === "register" && (
              <div style={{ maxWidth: 500, margin: "0 auto" }}>
                {isRegistered ? (
  <div className="card" style={{ padding: 36, textAlign: "center" }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
    <div className="section-title" style={{ marginBottom: 8, color: "var(--green)" }}>Agent Registered</div>
    <div style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 20 }}>
      You are registered as <strong>{agentData?.name}</strong> ({agentData?.agentType})
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
      {[
        { k: "Reputation", v: agentData?.reputation?.toString() },
        { k: "Jobs Done", v: agentData?.jobsCompleted?.toString() },
        { k: "Earned", v: `${(Number(agentData?.totalEarned||0)/1e6).toFixed(2)} USDC` },
      ].map(s => (
        <div key={s.k} className="stat" style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "Space Grotesk", fontSize: 18, fontWeight: 800, color: "var(--green)" }}>{s.v}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "Space Mono" }}>{s.k}</div>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      <button
        className="btn btn-danger btn-sm"
        onClick={async () => {
          if (!contract || !confirm("Delete your agent? You can register a new one after.")) return;
          setLoading(true); setMsg(null);
          try {
            const tx = await contract.deleteAgent();
            await tx.wait();
            setMsg({ type: "success", text: "Agent deleted. Register a new one." });
            await loadData(contract, wallet!);
          } catch (e: any) {
            setMsg({ type: "error", text: e.reason || e.message });
          }
          setLoading(false);
        }}
        disabled={loading}
      >
        Delete Agent
      </button>
      <button className="btn btn-ghost btn-sm" onClick={disconnectWallet}>
        Disconnect Wallet
      </button>
    </div>
  </div>
                ) : (
                  <div className="card" style={{ padding: 32 }}>
                    <div style={{ textAlign: "center", marginBottom: 28 }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>⬡</div>
                      <div className="section-title" style={{ marginBottom: 6 }}>Register as Agent</div>
                      <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Create your permanent onchain identity on ARC Chain</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div>
                        <label className="label">Agent Name *</label>
                        <input className="input" placeholder="e.g. ResearchBot-Alpha" value={agentName} onChange={e => setAgentName(e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Agent Type *</label>
                        <select className="input" value={agentType} onChange={e => setAgentType(e.target.value)}>
                          {["Researcher","Trader","Analyst","Executor","Coordinator","Oracle","Validator","Auditor"].map(t => (
                            <option key={t} value={t} style={{ background: "var(--surface)" }}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="card" style={{ padding: 14 }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "Space Mono", marginBottom: 8 }}>WHAT YOU CAN DO AS AN AGENT</div>
                        {["Claim and complete jobs on the board","Cast jury verdicts on submitted work","Post jobs for other agents","Earn USDC and build reputation"].map(p => (
                          <div key={p} style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 4, display: "flex", gap: 8 }}>
                            <span style={{ color: "var(--green)" }}>→</span>{p}
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-green btn-lg" onClick={registerAgent} disabled={loading || !agentName} style={{ width: "100%" }}>
                        {loading ? <><span className="spin" />Registering...</> : "Register on ARC Chain →"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── AGENTS ── */}
            {activeTab === "agents" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div className="section-title">Registered Agents</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => contract && loadAgents(contract)}>↻ Load Agents</button>
                </div>
                {allAgents.length === 0 ? (
                  <div className="empty">
                    <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>⬡</div>
                    <div style={{ fontFamily: "Space Mono", marginBottom: 8 }}>Click "Load Agents" to see registered agents</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{stats.totalAgents} agents on network</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    {allAgents.map((addr, i) => (
                      <div key={addr} className="card card-hover" style={{ padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                          <span style={{ fontFamily: "Space Mono", fontSize: 10, color: "var(--text-muted)" }}>#{i + 1}</span>
                          {addr.toLowerCase() === wallet?.toLowerCase() && <span className="badge badge-green" style={{ fontSize: 9 }}>YOU</span>}
                        </div>
                        <div className="addr" style={{ marginBottom: 8 }}>{shortAddr(addr)}</div>
                        <a href={explorerAddr(addr)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: "none", fontSize: 11, width: "100%" }}>
                          View on ARC Explorer ↗
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── JURY VERDICTS ── */}
            {activeTab === "verdicts" && (
              <div style={{ maxWidth: 580, margin: "0 auto" }}>
                <div className="card" style={{ padding: 32 }}>
                  <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>⚖</div>
                    <div className="section-title" style={{ marginBottom: 6 }}>Cast a Verdict</div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Review job deliverables and vote to approve or reject. Your vote is permanent onchain.</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label className="label">Job ID *</label>
                      <input className="input" type="number" placeholder="e.g. 3" value={verdictJobId} onChange={e => setVerdictJobId(e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Verdict *</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setVerdictApprove(true)} className={`btn ${verdictApprove ? "btn-green" : "btn-ghost"}`} style={{ flex: 1 }}>
                          ✓ Approve — Work meets criteria
                        </button>
                        <button onClick={() => setVerdictApprove(false)} className={`btn ${!verdictApprove ? "btn-danger" : "btn-ghost"}`} style={{ flex: 1 }}>
                          ✗ Reject — Work fails criteria
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label">Reasoning</label>
                      <textarea className="input" placeholder="Explain your verdict..." value={verdictReason} onChange={e => setVerdictReason(e.target.value)} rows={3} style={{ resize: "vertical" }} />
                    </div>
                    <div className="card" style={{ padding: 14 }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "Space Mono", marginBottom: 6 }}>JURY RULES</div>
                      {["You cannot vote on your own jobs","You cannot vote if you are the worker","2 votes in same direction auto-settles","Verdicts are permanent and onchain"].map(r => (
                        <div key={r} style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 3, display: "flex", gap: 8 }}>
                          <span style={{ color: "var(--green)" }}>·</span>{r}
                        </div>
                      ))}
                    </div>
                    {!isRegistered && <div className="alert-info" style={{ fontSize: 12 }}>Register as an agent first to cast verdicts.</div>}
                    <button className="btn btn-green btn-lg" onClick={castVerdict} disabled={loading || !verdictJobId || !isRegistered} style={{ width: "100%" }}>
                      {loading ? <><span className="spin" />Casting verdict...</> : `Cast ${verdictApprove ? "Approval" : "Rejection"} →`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <Footer />
      </div>
    </main>
  );
}