import Link from "next/link";
import { ChatBox } from "@/components/ChatBox";
import { resume } from "@/data/resume";

export const metadata = {
  title: "Ask",
  description:
    "Ask an AI-powered chatbox questions about Nishtha Arora's experience, projects, and skills, answered directly from her resume.",
};

export default function AskPage() {
  return (
    <div>
      <h1>Ask about {resume.name}</h1>
      <p>
        Hi, I&apos;m {resume.name}, a {resume.title.toLowerCase()}. Ask me anything about
        my experience, projects, or background — this chatbox answers using my actual
        resume.
      </p>
      <ChatBox />
      <p style={{ marginTop: "1.5rem" }}>
        Prefer to just see my resume?{" "}
        <Link href="/resume">
          <strong>View resume →</strong>
        </Link>
      </p>
    </div>
  );
}
