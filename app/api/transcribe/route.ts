import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    // Send to ElevenLabs Scribe v2
    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": apiKey! },
      body: formData, // ElevenLabs expects multipart/form-data
    });

    const data = await response.json();
    return NextResponse.json({ text: data.text });
  } catch (e) {
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}