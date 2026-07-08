import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { question } = await request.json();

  // TODO(chatbox phase): call the Gemini API with formatResumeForPrompt() as
  // system context plus `question`, instead of this stub response.
  return NextResponse.json({
    answer: `Stub response — the chatbox isn't wired up to an LLM yet. You asked: "${question}"`,
  });
}
