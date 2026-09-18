// src/app/api/location/search/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  // Instantly return an empty list if query is too brief
  if (!query || query.trim().length < 3) {
    return NextResponse.json([]);
  }

  try {
    // 🚀 FIXED: Server-side routing handles the dynamic link with real backticks and headers!
    const targetUrl = `https://openstreetmap.org{encodeURIComponent(query)}&addressdetails=1&limit=5`;
    
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "DollspaceProductionApp/1.0 (contact: admin@dollspace.com)"
      }
    });

    const data = await response.json();
    
    // Map data arrays cleanly into verified display text items
    const formattedSuggestions = data.map((item: any) => ({
      id: item.place_id,
      display_name: item.display_name
    }));

    return NextResponse.json(formattedSuggestions);
  } catch (err) {
    console.error("Server proxy location autocomplete engine error:", err);
    return NextResponse.json({ error: "Failed to fetch geography definitions" }, { status: 500 });
  }
}
