export const THREAD_COLORS: Record<string, { fg: string; bg: string }> = {
  "frontend-engineering": { fg: "var(--thread-frontend)", bg: "var(--thread-frontend-bg)" },
  "ai-agent-development": { fg: "var(--thread-ai)", bg: "var(--thread-ai-bg)" },
  "team-leadership": { fg: "var(--thread-leadership)", bg: "var(--thread-leadership-bg)" },
  testing: { fg: "var(--thread-testing)", bg: "var(--thread-testing-bg)" },
  platform: { fg: "var(--thread-platform)", bg: "var(--thread-platform-bg)" },
};

export function Pill({
  children,
  colorKey,
  href,
}: {
  children: React.ReactNode;
  colorKey?: string;
  href?: string;
}) {
  const color = (colorKey && THREAD_COLORS[colorKey]) || { fg: "var(--fg)", bg: "var(--input-bg)" };
  const hasThreadColor = Boolean(colorKey && THREAD_COLORS[colorKey]);
  const Tag = href ? "a" : "span";
  return (
    <Tag
      href={href}
      style={{
        display: "inline-block",
        color: color.fg,
        background: color.bg,
        border: `1px solid ${hasThreadColor ? color.fg : "var(--border)"}`,
        borderRadius: 16,
        padding: "0.25rem 0.75rem",
        fontSize: "0.85rem",
        fontWeight: 600,
        textDecoration: "none",
        marginRight: "0.5rem",
        marginBottom: "0.5rem",
      }}
    >
      {children}
    </Tag>
  );
}
