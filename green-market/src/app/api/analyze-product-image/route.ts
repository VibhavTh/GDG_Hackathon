import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { imageBase64, mimeType } = await request.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1" });

    const result = await model.generateContent([
      { inlineData: { data: imageBase64, mimeType } },
      "Return ONLY valid JSON with these fields: summary (1-2 sentence friendly paragraph identifying what you see and what kind of farm product it is), name (string), description (2-3 sentences string), category (one of: produce|baked_goods|dairy|eggs|meat|honey_beeswax|flowers|plants|handmade_crafts|value_added|mushrooms|other), unit (one of: each|lb|oz|bunch|dozen|pint|quart|bag|jar|box), price (number, typical USD farmers market price), is_organic (boolean)",
    ]);

    let text = result.response.text();
    // Strip possible markdown code fences
    text = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[analyze-product-image]", err);
    return NextResponse.json(
      { error: "Could not analyze image. Please fill in details manually." },
      { status: 500 }
    );
  }
}
