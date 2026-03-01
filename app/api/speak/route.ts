import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Mode = "urgent" | "joy" | "neutral";

export async function POST(req: Request) {
  try {
    const { text, mode } = (await req.json()) as { text?: string; mode?: Mode };

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2_5";

    const voiceUrgent =
      process.env.ELEVENLABS_VOICE_ID_URGENT || process.env.ELEVENLABS_VOICE_ID;
    const voiceJoy = process.env.ELEVENLABS_VOICE_ID_JOY;
    const voiceNeutral = process.env.ELEVENLABS_VOICE_ID_NEUTRAL;

    if (!apiKey) return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY" }, { status: 500 });
    if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });
    if (!voiceUrgent) {
      return NextResponse.json({ error: "Missing ELEVENLABS_VOICE_ID or ELEVENLABS_VOICE_ID_URGENT" }, { status: 500 });
    }

    const m: Mode = mode === "joy" || mode === "neutral" || mode === "urgent" ? mode : "urgent";

    const voiceId =
      m === "joy"
        ? (voiceJoy || voiceUrgent)
        : m === "neutral"
          ? (voiceNeutral || voiceUrgent)
          : voiceUrgent;

    const voice_settings =
      m === "joy"
        ? { stability: 0.35, similarity_boost: 0.85, style: 0.55, use_speaker_boost: true }
        : m === "neutral"
          ? { stability: 0.55, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true }
          : { stability: 0.45, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true };

    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings,
      }),
    });

    if (!r.ok) {
      const details = await r.text();
      return NextResponse.json(
        { error: "ElevenLabs failed", details, mode: m },
        { status: 500 }
      );
    }

    const audio = await r.arrayBuffer();

    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Server error", details: e?.message || String(e) }, { status: 500 });
  }
}

    
