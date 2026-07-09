import Image from "next/image";
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
      <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", marginBottom: "1rem" }}>
        <Image
          src="/headshot.jpg"
          alt={resume.name}
          width={80}
          height={80}
          style={{ borderRadius: "50%", objectFit: "cover" }}
        />
        <div>
          <h1 style={{ margin: 0 }}>Ask about {resume.name}</h1>
          <p style={{ margin: "0.25rem 0 0" }}>
            Hi, I&apos;m {resume.name}, a {resume.title.toLowerCase()}. Ask me anything
            about my experience, projects, or background — this chatbox answers using
            my actual resume.
          </p>
        </div>
      </div>
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
