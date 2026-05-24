export const AXIOM_ADDRESS = "0x9D0ED40615845ee6134F475AcCF35e0412CA1EdF";

export const ARC_TESTNET = {
  chainId: 5042002,
  chainIdHex: "0x4CDD72",
  name: "Arc Testnet",
  rpc: "https://rpc.testnet.arc.network",
  explorer: "https://testnet.arcscan.app",
  usdc: "0x3600000000000000000000000000000000000000",
  symbol: "USDC",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
};

export const AXIOM_ABI = [
  "function postJob(string calldata title, string calldata description, bytes32 criteriaHash) external payable returns (uint256)",
  "function submitWork(uint256 jobId, bytes32 outputHash, string calldata outputURI) external",
  "function castVerdict(uint256 jobId, bool pass, bytes calldata signature) external",
  "function settleJob(uint256 jobId) external",
  "function disputeJob(uint256 jobId) external",
  "function registerAgent(string calldata name, string calldata agentType) external",
  "function getJob(uint256 jobId) external view returns (tuple(uint256 id, address poster, address worker, string title, string description, bytes32 criteriaHash, bytes32 outputHash, string outputURI, uint256 reward, uint8 status, uint256 createdAt, uint256 settledAt, uint256 juryPass, uint256 juryFail))",
  "function getAgent(address wallet) external view returns (tuple(string name, string agentType, address wallet, uint256 reputation, uint256 jobsCompleted, uint256 totalEarned, bool active, uint256 registeredAt))",
  "function isRegistered(address) external view returns (bool)",
  "function jobCount() external view returns (uint256)",
  "function getStats() external view returns (uint256, uint256, uint256, uint256)",
  "event JobPosted(uint256 indexed jobId, address indexed poster, uint256 reward)",
  "event WorkSubmitted(uint256 indexed jobId, address indexed worker, bytes32 outputHash)",
  "event VerdictCast(uint256 indexed jobId, address indexed juror, bool pass)",
  "event JobSettled(uint256 indexed jobId, address indexed worker, uint256 reward)",
  "event JobDisputed(uint256 indexed jobId, uint256 timestamp)",
];

export const shortAddr = (a: string) => a.slice(0, 6) + "..." + a.slice(-4);
export const shortHash = (h: string) => h.slice(0, 10) + "..." + h.slice(-6);
export const explorerTx = (hash: string) => `${ARC_TESTNET.explorer}/tx/${hash}`;
export const explorerAddr = (addr: string) => `${ARC_TESTNET.explorer}/address/${addr}`;