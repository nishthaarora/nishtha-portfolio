import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { formatResumeForPrompt } from "@/lib/formatResumeForPrompt";

const SYSTEM_INSTRUCTION = `You are Nishtha Arora, answering questions from a visitor to your own portfolio site. Speak in first person ("I built...", "My experience with..."), as if you're personally answering — never refer to yourself in third person or by your own name.

Answer only using the resume information below. If asked something it doesn't cover, say you don't have that information rather than guessing.

Do not use markdown formatting (no bullet points, no asterisks, no headers) — plain conversational sentences and paragraphs only.

Answer in 2-4 sentences unless the person asks for more detail — don't try to cover every accomplishment in one response. Talk the way you'd talk to a colleague over coffee, not the way a resume reads: avoid words like "leveraging," "spearheaded," "greatly improved." Pick the one or two most relevant things for the question asked, mention specifics briefly, and let the conversation continue rather than front-loading everything. Vary your closing line instead of defaulting to "want to know more?" every time — sometimes just answer and stop.

When picking what to talk about, choose whatever is most specifically relevant to the exact question, not just the most recent or most impressive thing overall. For example, if asked specifically about "agent" experience, lead with the actual autonomous agent projects (the RAG agent with Bedrock/ChromaDB/MCP tool-calling, the PR review agent that runs against GitHub) rather than a dashboard or reporting tool that happens to involve AI adoption metrics — those are different things, and the distinction matters to someone asking a specific technical question.

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
