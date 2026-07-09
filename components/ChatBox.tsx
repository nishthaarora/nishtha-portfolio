"use client";

import { useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const EXAMPLE_PROMPTS = [
  "What have you built recently?",
  "What's your AI agent experience?",
  "What companies have you worked at?",
  "How do I contact you?",
];

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function fillPrompt(prompt: string) {
    setInput(prompt);
    inputRef.current?.focus();
  }

  async function sendMessage(overrideQuestion?: string) {
    const question = (overrideQuestion ?? input).trim();
    if (!question || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      const content = response.ok ? data.answer : data.error;
      setMessages([...nextMessages, { role: "assistant", content }]);
    } catch {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: "Sorry, something went wrong reaching the chat. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {messages.length === 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ opacity: 0.8, marginBottom: "0.5rem" }}>Try asking:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => fillPrompt(prompt)}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "0.4rem 0.8rem",
                  background: "var(--card-bg)",
                  cursor: "pointer",
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              alignSelf: message.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: message.role === "user" ? "var(--link)" : "var(--input-bg)",
              color: message.role === "user" ? "#ffffff" : "var(--fg)",
              border: message.role === "assistant" ? "1px solid var(--border)" : "none",
              borderRadius: 12,
              padding: "0.6rem 0.9rem",
            }}
          >
            {message.content}
          </div>
        ))}
        {loading && (
          <div
            aria-hidden="true"
            style={{
              alignSelf: "flex-start",
              background: "var(--input-bg)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "0.6rem 0.9rem",
              opacity: 0.7,
            }}
          >
            …
          </div>
        )}
      </div>

      <label htmlFor="chat-question" style={{ display: "block", marginBottom: "0.25rem" }}>
        Your question
      </label>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          id="chat-question"
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
          placeholder="Ask a question about Nishtha"
          disabled={loading}
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button onClick={() => sendMessage()} disabled={loading}>
          {loading ? "Thinking…" : "Send"}
        </button>
      </div>
    </div>
  );
}
