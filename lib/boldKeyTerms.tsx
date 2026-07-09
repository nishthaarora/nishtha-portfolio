const KEY_TERMS = [
  "LangChain",
  "ChromaDB",
  "Bedrock",
  "FastAPI",
  "FastMCP",
  "MCP",
  "Titan",
  "Claude Code",
  "Claude SDK",
  "Claude",
  "Gemini",
  "Cursor",
  "GitHub",
].sort((a, b) => b.length - a.length);

const KEY_TERMS_PATTERN = new RegExp(
  `(${KEY_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "g"
);

export function boldKeyTerms(text: string): React.ReactNode {
  const parts = text.split(KEY_TERMS_PATTERN);
  return parts.map((part, i) =>
    KEY_TERMS.includes(part) ? <strong key={i}>{part}</strong> : part
  );
}
