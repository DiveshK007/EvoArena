import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

/**
 * GET /api/aps
 *
 * Returns APS snapshots from agent/state/aps.json
 */
export async function GET() {
  try {
    const apsPath = path.resolve(process.cwd(), "../agent/state/aps.json");

    if (!fs.existsSync(apsPath)) {
      return NextResponse.json({ snapshots: [], message: "No APS data yet." });
    }

    const raw = fs.readFileSync(apsPath, "utf-8");
    const snapshots = JSON.parse(raw);

    return NextResponse.json({ snapshots });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, snapshots: [] }, { status: 500 });
  }
}
