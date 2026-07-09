"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const EXAMPLE_PROMPTS = [
  "What has she built recently?",
  "What's her AI agent experience?",
  "What companies has she worked at?",
  "How do I contact her?",
];

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
                onClick={() => sendMessage(prompt)}
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

      <div role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((message, index) => (
          <p key={index}>
            <strong>{message.role === "user" ? "You" : "Assistant"}:</strong>{" "}
            {message.content}
          </p>
        ))}
        {loading && (
          <p aria-hidden="true">
            <strong>Assistant:</strong> …
          </p>
        )}
      </div>

      <label htmlFor="chat-question" style={{ display: "block", marginBottom: "0.25rem" }}>
        Your question
      </label>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          id="chat-question"
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
