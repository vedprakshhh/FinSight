import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    if (!imageBase64) return NextResponse.json({ error: "Missing imageBase64" }, { status: 400 });

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are extracting receipt data.
Return STRICT JSON:
{
  "merchant": string,
  "date": string,
  "items": [{"name": string, "price": number}],
  "total": number
}
If unknown, use empty string or 0.
`;

    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const text = resp.text ?? "";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) return NextResponse.json({ raw: text }, { status: 200 });

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return NextResponse.json(parsed, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "Server error", details: e?.message || String(e) }, { status: 500 });
  }
}
