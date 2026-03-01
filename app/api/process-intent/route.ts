import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    const { transcript, balance } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are a financial assistant. Based on this transcript: "${transcript}", 
    identify if it's an income or an expense. 
    Return ONLY a JSON object with this structure:
    { "type": "income" | "variable", "amount": number, "title": string }
  `;

    const result = await model.generateContent(prompt);
    const jsonResponse = JSON.parse(result.response.text().replace(/```json|```/g, ""));
    return NextResponse.json(jsonResponse);
}