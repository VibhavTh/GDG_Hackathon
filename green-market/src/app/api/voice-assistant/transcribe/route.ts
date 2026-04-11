import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Deepgram not configured" }, { status: 500 });
  }

  // Read the raw audio blob from the request body
  const audioBuffer = await request.arrayBuffer();
  if (!audioBuffer || audioBuffer.byteLength === 0) {
    return NextResponse.json({ error: "No audio data received" }, { status: 400 });
  }

  // Get keyword hints from query params (product names passed from widget)
  const { searchParams } = new URL(request.url);
  const keywordsParam = searchParams.get("keywords") ?? "";
  const keywords = keywordsParam
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => `${k}:5`) // boost weight
    .join(",");

  const deepgramUrl = new URL("https://api.deepgram.com/v1/listen");
  deepgramUrl.searchParams.set("model", "nova-2");
  deepgramUrl.searchParams.set("language", "en-US");
  deepgramUrl.searchParams.set("punctuate", "true");
  if (keywords) {
    deepgramUrl.searchParams.set("keywords", keywords);
  }

  // Deepgram only accepts base mime types -- strip codec parameters
  const rawContentType = request.headers.get("content-type") ?? "audio/webm";
  const contentType = rawContentType.split(";")[0].trim() || "audio/webm";

  let dgResponse: Response;
  try {
    dgResponse = await fetch(deepgramUrl.toString(), {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": contentType,
      },
      body: audioBuffer,
    });
  } catch (fetchErr) {
    console.error("[transcribe] Deepgram fetch failed:", fetchErr);
    return NextResponse.json({ error: "Could not reach transcription service" }, { status: 502 });
  }

  if (!dgResponse.ok) {
    const errText = await dgResponse.text();
    console.error("[transcribe] Deepgram error:", dgResponse.status, errText);
    return NextResponse.json({ error: "Transcription failed" }, { status: 502 });
  }

  const dgData = await dgResponse.json();
  const transcript: string =
    dgData?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

  return NextResponse.json({ transcript });
}
