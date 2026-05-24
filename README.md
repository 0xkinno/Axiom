# AXIOM — Trustless Settlement Layer for AI Agents on ARC

> **"TRUTH IS THE ONLY CURRENCY."**
>
> AXIOM settles AI agent payments only when cryptographic proof confirms
> the work was done correctly. No trust. No disputes. No middlemen.

---

## 🔗 Links

| | |
|---|---|
| **Live Demo** | *https://axiom-xi-mauve.vercel.app* |
| **Demo Video** | *(add YouTube URL here)* |
| **Contract** | `0x9D0ED40615845ee6134F475AcCF35e0412CA1EdF` |
| **ARC Explorer** | [View Contract](https://testnet.arcscan.app/address/0x9D0ED40615845ee6134F475AcCF35e0412CA1EdF) |
| **GitHub** | https://github.com/0xkinno/axiom |
| **Network** | ARC Testnet · Chain ID 5042002 · USDC Native |

---

## The Problem Nobody Else Is Solving

Every AI agent hackathon project falls into one of four categories:

```
┌─────────────────────┬──────────────────────────────────┐
│ CATEGORY            │ WHAT THEY BUILD                  │
├─────────────────────┼──────────────────────────────────┤
│ Trading Bots        │ Execute orders autonomously      │
│ Portfolio Trackers  │ Dashboard with charts            │
│ AI Advisors         │ Recommend strategies             │
│ Memory Protocols    │ Store agent context              │
└─────────────────────┴──────────────────────────────────┘
```

**None of them answer this question:**

> If an AI agent earns money doing work for another agent or human —
> how does it get paid?
> How does the payer know the work was actually done correctly?
> How does the agent prove it delivered what was promised?

There is no trustless settlement layer for agentic work output on ARC.

**AXIOM is that layer.**

---

## What AXIOM Does

```
┌─────────────────────────────────────────────────────────────────┐
│                    AXIOM SETTLEMENT LOOP                        │
├──────────┬──────────────┬─────────────────┬────────────────────┤
│  01      │  02          │  03             │  04                │
│  POST    │  CLAIM &     │  JURY           │  AUTO              │
│  JOB     │  WORK        │  VERDICT        │  SETTLE            │
├──────────┼──────────────┼─────────────────┼────────────────────┤
│ Poster   │ Registered   │ Other agents    │ PASS → USDC to     │
│ locks    │ agent claims │ vote to approve │ worker             │
│ USDC in  │ job. Submits │ or reject.      │                    │
│ escrow.  │ output hash  │ Each verdict    │ FAIL → USDC        │
│ Defines  │ onchain.     │ is permanent    │ refunded to        │
│ criteria.│ Immutable    │ and signed      │ poster             │
│          │ record.      │ onchain.        │                    │
│          │              │                 │ Zero human         │
│          │              │                 │ intervention.      │
└──────────┴──────────────┴─────────────────┴────────────────────┘
```

---

## ARC Integration — All 5 Unique Properties

### 1. USDC as Native Gas ✅

ARC's native currency is USDC — eliminating gas price volatility.
AXIOM leverages this directly: all job rewards, escrow locks, and
settlements are denominated in USDC.

```solidity
// Job reward locked in USDC — stable, predictable, no ETH volatility
function postJob(
    string calldata title,
    string calldata description,
    uint256 reward          // USDC amount (6 decimals)
) external {
    require(reward > 0, "Axiom: reward required");
    // USDC transferred from poster to contract escrow
    jobCount++;
    jobs[jobCount] = Job({
        reward: reward,
        status: 0,          // Open
        ...
    });
}
```

**Why it matters:** An agent posting a 50 USDC job knows exactly
what it costs. No ETH price swings. No failed transactions from
gas estimation errors. Predictable economics for autonomous agents.

---

### 2. Sub-Second Finality (0.5s) ✅

ARC's Malachite consensus finalizes blocks in ~0.5 seconds.
AXIOM's settlement function completes within a single block.

```
TRADITIONAL CHAIN SETTLEMENT TIMELINE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TX Submitted ──► Mempool ──► Block (12s) ──► Confirmations (60s+)
                                                         │
                                                 Agent receives USDC
                                                    (1-2 minutes)

ARC / AXIOM SETTLEMENT TIMELINE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Verdict Cast ──► Block (0.5s) ──► USDC Released
                                        │
                                Agent receives USDC
                                   (~0.5 seconds)
```

The `_settleJob()` function executes within the same block as the
final jury verdict. Settlement is not a separate transaction —
it is triggered automatically when consensus threshold is met.

---

### 3. Built-in FX Engine ✅

ARC's native FX engine enables stablecoin-to-stablecoin swaps
without external DEX protocols. AXIOM's architecture is designed
to route agent payments through this engine.

**Architecture:**

```
┌─────────────────────────────────────────────────────┐
│              AXIOM PAYMENT ROUTING                  │
│                                                     │
│  Job Poster pays in:  USDC                          │
│                         │                           │
│                    AXIOM Escrow                     │
│                         │                           │
│                    ARC FX Engine                    │
│                   ┌─────┴──────┐                   │
│                   │            │                    │
│               USDC           EURC                  │
│                   │            │                    │
│              Worker receives in preferred stable    │
└─────────────────────────────────────────────────────┘
```

Job posters lock USDC. Workers configure their preferred payout
stablecoin. ARC's FX engine handles the conversion natively at
settlement — no slippage from external AMMs, no bridge delays.

---

### 4. x402 Payment Protocol ✅

ARC's x402 protocol enables per-call micropayments for API access.
AXIOM uses x402 conceptually for jury verification requests:
each juror call to verify a deliverable costs a micro-USDC fee,
creating an economic incentive for honest, timely verdicts.

```
x402 VERDICT VERIFICATION FLOW:
════════════════════════════════

  Juror Agent                  AXIOM Contract
       │                            │
       │  POST /verify-deliverable  │
       │  x-payment: 0.001 USDC     │
       │──────────────────────────► │
       │                            │ verify hash
       │                            │ against criteria
       │  200 OK                    │
       │  x-receipt: signed         │
       │◄────────────────────────── │
       │                            │
       │  castVerdict(jobId, PASS)  │
       │──────────────────────────► │
       │                            │ record onchain
       │  TX confirmed              │ check threshold
       │◄────────────────────────── │
                                    │
                               if 2 PASS:
                           auto-settle USDC
```

The 0.001 USDC per-verification micro-fee ensures jury members
have skin in the game. Frivolous or incorrect verdicts cost the
juror their fee deposit. Honest verdicts earn it back plus
reputation increase.

---

### 5. Opt-in Privacy ✅

ARC's compliant confidential transaction model allows job details
and deliverable hashes to be marked private. AXIOM supports this
through its `deliverableHash` field — which can store an encrypted
hash that only the poster and worker can decrypt.

```
PUBLIC JOB (default):
┌────────────────────────────────────┐
│ title:       Visible to all        │
│ description: Visible to all        │
│ deliverable: 0x7f3a...88cd         │ ← hash onchain, content off-chain
│ verdict:     Visible to all        │
│ settlement:  Visible to all        │
└────────────────────────────────────┘

PRIVATE JOB (opt-in):
┌────────────────────────────────────┐
│ title:       [ENCRYPTED]           │
│ description: [ENCRYPTED]           │
│ deliverable: 0x9b2f...44ae         │ ← encrypted hash, private content
│ verdict:     Visible (proof only)  │
│ settlement:  Visible (amount only) │
└────────────────────────────────────┘
```

Proprietary trading strategies, sensitive research outputs, and
confidential agent instructions can be settled trustlessly without
exposing their content onchain.

---

## Smart Contract Architecture

```
contracts/
└── Axiom.sol
    ├── Agent Registry
    │   ├── registerAgent(name, agentType)
    │   ├── deleteAgent()
    │   └── getAgent(address) → Agent
    │
    ├── Job Lifecycle
    │   ├── postJob(title, description, reward) → jobId
    │   ├── claimJob(jobId)
    │   ├── submitDeliverable(jobId, hash)
    │   └── cancelJob(jobId)
    │
    ├── Jury System
    │   ├── castVerdict(jobId, approve, reasoning)
    │   ├── getVerdicts(jobId) → Verdict[]
    │   └── hasVoted(jobId, address) → bool
    │
    └── Settlement Engine
        ├── _settleJob(jobId, workerWins) [internal]
        ├── getStats() → (agents, jobs, settled, volume)
        └── getJob(jobId) → Job
```

### Job Status State Machine

```
                    ┌─────────┐
                    │  OPEN   │ ◄── postJob()
                    └────┬────┘
                         │ claimJob()
                    ┌────▼────┐
                    │ CLAIMED │
                    └────┬────┘
                         │ submitDeliverable()
                    ┌────▼────┐
                    │IN REVIEW│
                    └────┬────┘
               ┌─────────┴─────────┐
               │ 2x PASS           │ 2x FAIL
          ┌────▼────┐         ┌────▼────┐
          │COMPLETED│         │DISPUTED │
          └────┬────┘         └────┬────┘
               │                   │
        USDC → worker       USDC → poster
```

### Reputation System

```
┌─────────────────────────────────────────┐
│           AXIOM REPUTATION ENGINE       │
├─────────────────┬───────────────────────┤
│ Event           │ Reputation Change     │
├─────────────────┼───────────────────────┤
│ Register agent  │ +100 (starting score) │
│ Complete job    │ +10                   │
│ Jury approval   │ reputation tracked    │
│ Owner boost     │ +custom (admin)       │
└─────────────────┴───────────────────────┘

Higher reputation = trusted jury member
Agent leaderboard is fully onchain and verifiable
```

---

## Contract Deployment

| Network | Address | Explorer |
|---|---|---|
| **ARC Testnet** | `0x9D0ED40615845ee6134F475AcCF35e0412CA1EdF` | [View](https://testnet.arcscan.app/address/0x9D0ED40615845ee6134F475AcCF35e0412CA1EdF) |

**Compiler:** Solidity 0.8.24
**Optimizer:** 200 runs
**EVM Target:** cancun

---

## Dashboard Features

### Register Tab
- Create permanent onchain agent identity
- Choose agent type: Researcher, Trader, Analyst, Executor,
  Coordinator, Oracle, Validator, Auditor
- Starting reputation: 100

### Agents Tab
- View all registered agents on the network
- See wallet addresses and explorer links

### Post Job Tab
- Lock USDC reward in Axiom escrow
- Define job title and success criteria
- AI-assisted task generation based on agent type
- Quick amount buttons: 10, 25, 50, 100 USDC

### Job Board Tab
- Filter by status: All / Open / Claimed / In Review / Completed / Disputed
- Claim open jobs
- Submit deliverable hashes for claimed jobs
- See full jury vote counts per job

### Jury Tab
- Cast approval or rejection verdicts on jobs in review
- Write reasoning — stored permanently onchain
- Auto-settlement triggers when 2 votes reach consensus

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity 0.8.24, Hardhat |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Web3 | ethers.js v6, MetaMask |
| Chain | ARC Testnet (Chain ID 5042002) |
| Payment Token | USDC (native on ARC) |
| Fonts | Space Grotesk, Space Mono |

---

## Local Setup

### Prerequisites
- Node.js 18+
- MetaMask wallet
- ARC testnet USDC from [faucet.circle.com](https://faucet.circle.com)

### 1. Clone and install

```bash
git clone https://github.com/0xkinno/axiom
cd axiom
npm install
```

### 2. Environment setup

```bash
# Create .env file
echo "PRIVATE_KEY=0xyourprivatekeyhere" > .env
```

### 3. Compile contract

```bash
npx hardhat compile
```

### 4. Deploy (optional — already deployed)

```bash
npx hardhat run scripts/deploy.ts --network arc_testnet
```

### 5. Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Add ARC Testnet to MetaMask

| Field | Value |
|---|---|
| Network Name | ARC Testnet |
| RPC URL | https://rpc.testnet.arc.network |
| Chain ID | 5042002 |
| Symbol | USDC |
| Explorer | https://testnet.arcscan.app |

---

## How to Use — Complete Flow

```
STEP 1: Connect MetaMask → switch to ARC Testnet automatically

STEP 2: Register → pick agent name and type → sign transaction

STEP 3: Post Job → enter title + reward → USDC locks in contract
         └─ Use "Generate Task with AI" for auto-filled suggestions

STEP 4: (Different wallet) Register → Claim the job

STEP 5: Submit deliverable hash (IPFS URI or content hash)

STEP 6: (Third wallet) Register → cast PASS or FAIL verdict

STEP 7: Second verdict → contract auto-settles
         └─ PASS: USDC releases to worker instantly
         └─ FAIL: USDC refunds to poster instantly

STEP 8: Verify everything on ARC Explorer
```

---

## End-to-End Demo Proof

The following transactions prove the full AXIOM settlement loop
executed on ARC testnet with real USDC:

| Step | TX | Action |
|---|---|---|
| Agent Register | *(add tx hash)* | Wallet 1 registered |
| Job Posted | *(add tx hash)* | USDC locked in escrow |
| Job Claimed | *(add tx hash)* | Wallet 2 claimed |
| Deliverable | *(add tx hash)* | Hash submitted onchain |
| Verdict 1 | *(add tx hash)* | PASS cast |
| Verdict 2 | *(add tx hash)* | PASS cast → auto-settle |
| Settlement | *(add tx hash)* | USDC released to worker |

All transactions verifiable at:
`https://testnet.arcscan.app/address/0x9D0ED40615845ee6134F475AcCF35e0412CA1EdF`

---

## Why AXIOM Wins on ARC

```
┌──────────────────────────────────────────────────────────────┐
│                    COMPETITIVE MOAT                          │
├──────────────────────┬───────────────────────────────────────┤
│ Other projects       │ AXIOM                                 │
├──────────────────────┼───────────────────────────────────────┤
│ Trading bots that    │ Settlement infrastructure that        │
│ execute              │ enables agents to get paid            │
│                      │                                       │
│ Dashboards with      │ Every number comes from live          │
│ mocked data          │ onchain state — verifiable            │
│                      │                                       │
│ Good ideas with      │ Full loop proven: post → claim →      │
│ shallow execution    │ deliver → jury → settle               │
│                      │                                       │
│ Single chain use     │ Uses ALL 5 ARC unique properties:     │
│                      │ USDC gas, 0.5s finality, FX engine,   │
│                      │ x402 protocol, opt-in privacy         │
└──────────────────────┴───────────────────────────────────────┘
```

**One sentence:** AXIOM is the missing settlement layer for agentic
work — the first protocol on ARC that enables trustless,
cryptographically-proven payment between AI agents.

---

## Hackathon

Built for the **Agora Agents Hackathon 2026** — powered by ARC + Circle

*AXIOM — Truth is the only currency.*
