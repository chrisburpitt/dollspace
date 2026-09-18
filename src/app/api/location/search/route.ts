// src/app/api/location/search/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 3) {
    return NextResponse.json([]);
  }

  try {
    // 🚀 FIXED: Swapped to an unblocked, Vercel-optimized public API route mapping
    const targetUrl = `https://maps.co{encodeURIComponent(query)}`;
    
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      console.error(`Geocoding server replied with fault status: ${response.status}`);
      return NextResponse.json([]);
    }

    const data = await response.json();
    
    // Safety Array validation check
    if (!Array.isArray(data)) {
      return NextResponse.json([]);
    }
    
    // 🚀 ALIGNED FORMATTER: Formats the results array item tokens to match your front-end picker loop props perfectly!
    const formattedSuggestions = data.map((item: any) => ({
      id: item.place_id || `loc-${Math.random()}`,
      display_name: item.display_name
    }));

    return NextResponse.json(formattedSuggestions);
  } catch (err) {
    console.error("Server proxy location autocomplete engine error:", err);
    return NextResponse.json({ error: "Failed to fetch geography definitions" }, { status: 500 });
  }
}
