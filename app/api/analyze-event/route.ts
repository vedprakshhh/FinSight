import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { eventTitle, predictedCost, currentBalance, safeToSpend } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are FinSight, an AI agent for budgeting around calendar events.

Context:
- Event: ${eventTitle}
- Predicted cost: ${predictedCost}
- Current balance: ${currentBalance}
- Safe to spend (remaining): ${safeToSpend}

Return STRICT JSON with this schema:
{
  "summary": string,
  "overBudgetBy": number,
  "alternatives": [{"title": string, "why": string, "saves": number}],
  "draftMessage": string,
  "friendAcceptance": number
}

Rules:
- Provide exactly 3 alternatives.
- draftMessage must be friendly, human, copy-paste ready.
- friendAcceptance is 0-100.
`;

    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = resp.text ?? "";

    // try to extract JSON safely (demo-friendly)
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({ raw: text }, { status: 200 });
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return NextResponse.json(parsed, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "Server error", details: e?.message || String(e) }, { status: 500 });
  }
}
