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

    const prompt = `You are a product listing assistant for Green Market Farms, a small family-run farm that sells at the Blacksburg, Virginia farmers market.

A farmer has uploaded a photo of one of their products. Analyze the image and return a JSON object to help them create a storefront listing.

Return ONLY valid JSON with exactly these fields:
- summary: 2-3 sentences. Identify what the product is, note any visual qualities like color, ripeness, or how it's presented, and say something genuine about why it looks good. Written in second person to the farmer, e.g. "Looks like you've got a nice batch of Honeycrisp apples here...". This is shown to the farmer as confirmation of what you identified.
- name: The plain common name of the product only -- no adjectives, no farm branding, no variety unless it meaningfully changes what the product is. Examples: "Apples", "Eggs", "Sourdough Bread", "Wildflower Honey", "Cherry Tomatoes". 1-3 words max.
- description: 2 sentences max. Write like a real person who knows this farm, not a copywriter. Short, specific, present tense. Mention one real detail -- flavor, texture, how it was grown, or how to use it. No fluff, no exclamation points.
- category: One of exactly: vegetables | fruits | baked_goods | dairy | eggs | meat | honey_beeswax | flowers | plants | handmade_crafts | value_added | mushrooms | other
- unit: One of exactly: each | lb | oz | bunch | dozen | pint | quart | bag | jar | box
- price: A number -- typical USD price at a Virginia farmers market for this product and unit. Be realistic, not grocery store prices.
- is_organic: true if the product visually appears organically grown or the image contains organic labeling, otherwise false.

If you cannot identify a farm product in the image, return: {"error": "Could not identify a farm product in this image."}`;

    const result = await model.generateContent([
      { inlineData: { data: imageBase64, mimeType } },
      prompt,
    ]);

    let text = result.response.text();
    // Strip possible markdown code fences
    text = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();

    const data = JSON.parse(text);
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 422 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[analyze-product-image]", err);
    return NextResponse.json(
      { error: "Could not analyze image. Please fill in details manually." },
      { status: 500 }
    );
  }
}
