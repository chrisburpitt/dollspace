// src/app/api/location/search/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  // Instantly return an empty array if the search input text is too short
  if (!query || query.trim().length < 3) {
    return NextResponse.json([]);
  }

  try {
    // 🚀 UNBLOCKED BACKEND PROXY: Calls Nominatim from the server layer to bypass browser CORS blocks
    const targetUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
    
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        // Strict OpenStreetMap Requirement: Identifies your platform to prevent automated 403 rejections
        "User-Agent": "DollspaceProductionApp/1.2 (contact: admin@dollspace.com)"
      }
    });

    if (!response.ok) {
      console.error(`OpenStreetMap responded with a fault code: ${response.status}`);
      return NextResponse.json([]);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return NextResponse.json([]);
    }
    
    // Format payload properties to map cleanly onto your frontend layout list loops
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
