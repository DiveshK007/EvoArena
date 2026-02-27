export const EVOPOOL_ABI = [
  "function getReserves() view returns (uint256, uint256)",
  "function feeBps() view returns (uint256)",
  "function curveBeta() view returns (uint256)",
  "function curveMode() view returns (uint8)",
  "function tradeCount() view returns (uint256)",
  "function cumulativeVolume0() view returns (uint256)",
  "function cumulativeVolume1() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function swap(bool zeroForOne, uint256 amountIn, uint256 minAmountOut) returns (uint256)",
  "function addLiquidity(uint256 amount0, uint256 amount1) returns (uint256)",
  "function removeLiquidity(uint256 liquidity) returns (uint256, uint256)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function reserve0() view returns (uint256)",
  "function reserve1() view returns (uint256)",
  "function MAX_FEE_BPS() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "event Swap(address indexed sender, bool zeroForOne, uint256 amountIn, uint256 amountOut, uint256 feeAmount)",
  "event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity)",
  "event LiquidityRemoved(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity)",
  "event ParametersUpdated(uint256 newFeeBps, uint256 newCurveBeta, uint8 newMode, address indexed agent)",
] as const;

export const CONTROLLER_ABI = [
  "function registerAgent() payable",
  "function submitParameterUpdate(uint256 newFeeBps, uint256 newCurveBeta, uint8 newCurveMode)",
  "function getAgentInfo(address) view returns (tuple(address agentAddress, uint256 bondAmount, uint256 registeredAt, uint256 lastUpdateTime, bool active))",
  "function getAgentCount() view returns (uint256)",
  "function agentList(uint256) view returns (address)",
  "function cooldownSeconds() view returns (uint256)",
  "function minBond() view returns (uint256)",
  "function maxFeeDelta() view returns (uint256)",
  "function maxBetaDelta() view returns (uint256)",
  "function paused() view returns (bool)",
  "function pool() view returns (address)",
  "event AgentRegistered(address indexed agent, uint256 bondAmount)",
  "event AgentUpdateProposed(address indexed agent, uint256 newFeeBps, uint256 newCurveBeta, uint8 newCurveMode, uint256 timestamp)",
  "event AgentSlashed(address indexed agent, uint256 slashAmount, string reason)",
] as const;

export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
] as const;

export const CURVE_MODES = ["Normal", "Defensive", "VolatilityAdaptive"] as const;

// Fill these from deployment.json or .env.local
export const ADDRESSES = {
  evoPool: process.env.NEXT_PUBLIC_EVOPOOL_ADDRESS || "",
  agentController: process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS || "",
  tokenA: process.env.NEXT_PUBLIC_TOKEN_A_ADDRESS || "",
  tokenB: process.env.NEXT_PUBLIC_TOKEN_B_ADDRESS || "",
};

export const BSC_TESTNET_CHAIN_ID = 97;
export const BSC_TESTNET_RPC = "https://data-seed-prebsc-1-s1.binance.org:8545/";
