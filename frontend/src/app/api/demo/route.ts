import { NextResponse } from "next/server";

/**
 * POST /api/demo
 * 
 * Triggers the off-chain agent in --once mode.
 * For the hackathon demo, this returns a mock response.
 * In production, this would spawn the agent process or call its API.
 */
export async function POST() {
  try {
    // In a real setup, you'd exec the agent here:
    // const { execSync } = require("child_process");
    // const output = execSync("cd ../agent && npm run once", { timeout: 30000 });
    
    // For demo, return a simulated response
    const mockResult = {
      success: true,
      ruleFired: "moderate-volatility",
      feeBps: 40,
      curveBeta: 5500,
      curveMode: 2,
      curveModeName: "VolatilityAdaptive",
      txHash: null, // would be real tx hash on testnet
      aps: 0.42,
      message: "Agent epoch completed. Configure agent .env to enable live transactions.",
    };

    return NextResponse.json(mockResult);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
