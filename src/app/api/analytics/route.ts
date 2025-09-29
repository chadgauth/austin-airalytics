import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "analytics_results.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading analytics data:", error);
    return NextResponse.json(
      { error: "Failed to load analytics data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const filePath = path.join(process.cwd(), "analytics_results.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContents);

    const body = await request.json();
    const { amenities, neighbourhood, room_type, accommodates, bedrooms, bathrooms } = body;

    // Base prediction using model
    let predictedPrice = data.summary.model_intercept;

    // Add neighbourhood effect (simplified - using average price difference)
    if (neighbourhood) {
      const nbh = data.neighbourhood_analysis.find((n: any) => n.neighbourhood.toString() === neighbourhood.toString());
      if (nbh) {
        predictedPrice += nbh.avg_price - data.summary.avg_price;
      }
    }

    // Add room type effect
    if (room_type) {
      const rt = data.room_type_analysis.find((r: any) => r.room_type === room_type);
      if (rt) {
        predictedPrice += rt.avg_price - data.summary.avg_price;
      }
    }

    // Add amenity effects
    if (amenities && Array.isArray(amenities)) {
      amenities.forEach((amenity: string) => {
        const coeff = data.hedonic_coefficients[amenity];
        if (coeff && coeff.significant === 1) {
          predictedPrice += coeff.uplift_pct / 100 * data.summary.avg_price;
        }
      });
    }

    // Add size effects (simplified)
    if (accommodates) predictedPrice += (accommodates - 2) * 10; // rough estimate
    if (bedrooms) predictedPrice += (bedrooms - 1) * 15;
    if (bathrooms) predictedPrice += (bathrooms - 1) * 20;

    return NextResponse.json({
      predictedPrice: Math.max(0, predictedPrice),
      basePrice: data.summary.avg_price,
      confidence: 0.85, // placeholder
      factors: {
        neighbourhood: neighbourhood ? data.neighbourhood_analysis.find((n: any) => n.neighbourhood.toString() === neighbourhood.toString())?.avg_price || 0 : 0,
        room_type: room_type ? data.room_type_analysis.find((r: any) => r.room_type === room_type)?.avg_price || 0 : 0,
        amenities: amenities?.length || 0,
        size: (accommodates || 0) + (bedrooms || 0) + (bathrooms || 0)
      }
    });
  } catch (error) {
    console.error("Error processing prediction:", error);
    return NextResponse.json(
      { error: "Failed to process prediction" },
      { status: 500 }
    );
  }
}
