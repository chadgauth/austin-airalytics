import fs from "fs";
import { type NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    // Read the analytics results file
    const filePath = path.join(process.cwd(), "analytics_results.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const analyticsData = JSON.parse(fileContents);

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error reading analytics data:", error);
    return NextResponse.json(
      { error: "Failed to load analytics data" },
      { status: 500 },
    );
  }
}
