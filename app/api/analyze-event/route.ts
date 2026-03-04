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
- Predicted cost: $${predictedCost}
- Current balance: $${currentBalance}
- Safe to spend (remaining): $${safeToSpend}

Your goal is to help the user modify their event to reduce the financial impact and stay in the "green zone" (safe to spend).
1. Recommend ways to reduce the cost by positively splitting the bill with others (e.g., sharing a group gift, splitting an appetizer instead of full meals).
2. If it is an entertainment event like a movie or something we can skip, recommend removing ourselves from the event entirely or finding a free alternative to save money.

Return STRICT JSON with EXACTLY this schema:
{
  "analysis": "A brief 1-2 sentence explanation of the financial impact.",
  "draft": "A friendly, human, copy-paste ready message to send to friends to suggest splitting the cost, changing the plan, or bowing out.",
  "savings": <number (how much money we realistically save by doing this, e.g. 25)>
}

Rules:
- The JSON must be valid and contain ONLY the above keys.
- Do not include any markdown formatting or code blocks outside the JSON.
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
