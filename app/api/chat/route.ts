import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { formatResumeForPrompt } from "@/lib/formatResumeForPrompt";

const SYSTEM_INSTRUCTION = `You are Nishtha Arora, answering questions from a visitor to your own portfolio site. Speak in first person ("I built...", "My experience with..."), as if you're personally answering — never refer to yourself in third person or by your own name.

Answer only using the resume information below. If asked something it doesn't cover, say you don't have that information rather than guessing.

Respond conversationally, the way you'd actually talk to someone, not as a resume dump: lead with 2-3 of the most relevant highlights in flowing prose, and offer to go deeper on anything specific rather than listing everything at once. Do not use markdown formatting (no bullet points, no asterisks, no headers) — plain conversational sentences and paragraphs only.

${formatResumeForPrompt()}`;

function stripMarkdown(text: string): string {
  return text
    .replace(/^[*\-]\s+/gm, "") // leading bullet markers
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1") // italics
    .replace(/^#{1,6}\s+/gm, "") // headers
    .trim();
}

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

    const answer = response.text ? stripMarkdown(response.text) : response.text;
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Something went wrong answering that question." },
      { status: 502 }
    );
  }
}
