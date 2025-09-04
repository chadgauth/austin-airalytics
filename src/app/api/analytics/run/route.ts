import { type NextRequest, NextResponse } from "next/server";
import { exec } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // Get the current working directory
    const cwd = process.cwd();

    // Path to the Rust binary (compiled from analytics/src/main.rs)
    const binaryPath = path.join(cwd, "analytics", "target", "release", "airbnb-analytics");

    // Run the Rust binary
    const { stdout, stderr } = await execAsync(`"${binaryPath}"`, {
      cwd: path.join(cwd, "analytics"),
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });

    if (stderr) {
      console.warn("Python script stderr:", stderr);
    }

    // Read the updated analytics results
    const fs = require("node:fs").promises;
    const resultsPath = path.join(cwd, "analytics_results.json");
    const resultsContent = await fs.readFile(resultsPath, "utf8");
    const analyticsData = JSON.parse(resultsContent);

    return NextResponse.json({
      success: true,
      message: "Analytics updated successfully",
      data: analyticsData,
      output: stdout,
    });
  } catch (error) {
    console.error("Error running Python analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
