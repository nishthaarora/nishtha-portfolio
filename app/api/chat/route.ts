import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { formatResumeForPrompt } from "@/lib/formatResumeForPrompt";

const SYSTEM_INSTRUCTION = `You are answering questions from a visitor to Nishtha Arora's portfolio site. Answer only using the resume information below. If asked something the resume doesn't cover, say you don't have that information rather than guessing.

${formatResumeForPrompt()}`;

export async function POST(request: Request) {
  const { question } = await request.json();

  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chat is not configured on this deployment yet." },
      { status: 503 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return NextResponse.json({ answer: response.text });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Something went wrong answering that question." },
      { status: 502 }
    );
  }
}
