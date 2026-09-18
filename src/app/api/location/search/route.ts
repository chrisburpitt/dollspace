// src/app/api/location/search/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 3) {
    return NextResponse.json([]);
  }

  try {
    // 🚀 FREE & UNBLOCKED: Uses Nominatim search text string endpoint directly
    const targetUrl = `https://openstreetmap.org{encodeURIComponent(query)}&format=json&limit=5`;
    
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        // Nominatim strict requirement: Must pass a real descriptive header tool to avoid automatic cloud function rejection blocks
        "User-Agent": "DollspaceProductionApp/1.1 (admin@dollspace.com)"
      }
    });

    if (!response.ok) {
      console.error(`Geocoding server error: ${response.status}`);
      return NextResponse.json([]);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return NextResponse.json([]);
    }
    
    // Format payload properties to map cleanly onto your frontend layout list loop
    const formattedSuggestions = data.map((item: any) => ({
      id: String(item.place_id || Math.random()),
      display_name: item.display_name
    }));

    return NextResponse.json(formattedSuggestions);
  } catch (err) {
    console.error("Server proxy location autocomplete engine error:", err);
    return NextResponse.json([]);
  }
}
