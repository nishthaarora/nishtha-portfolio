import { resume } from "@/data/resume";
import { projects } from "@/data/projects";

const THREAD_COLORS: Record<string, { fg: string; bg: string }> = {
  "frontend-engineering": { fg: "var(--thread-frontend)", bg: "var(--thread-frontend-bg)" },
  "ai-agent-development": { fg: "var(--thread-ai)", bg: "var(--thread-ai-bg)" },
  "team-leadership": { fg: "var(--thread-leadership)", bg: "var(--thread-leadership-bg)" },
};

const SKILL_CATEGORY_ANCHOR: Record<string, string> = {
  Frontend: "frontend-engineering",
  "AI & Automation": "ai-agent-development",
  Leadership: "team-leadership",
};

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

function boldKeyTerms(text: string): React.ReactNode {
  const parts = text.split(KEY_TERMS_PATTERN);
  return parts.map((part, i) =>
    KEY_TERMS.includes(part) ? <strong key={i}>{part}</strong> : part
  );
}

function Pill({
  children,
  anchorId,
  href,
}: {
  children: React.ReactNode;
  anchorId?: string;
  href?: string;
}) {
  const color = (anchorId && THREAD_COLORS[anchorId]) || { fg: "var(--fg)", bg: "var(--input-bg)" };
  const Tag = href ? "a" : "span";
  return (
    <Tag
      href={href}
      style={{
        display: "inline-block",
        color: color.fg,
        background: color.bg,
        border: `1px solid ${anchorId && THREAD_COLORS[anchorId] ? color.fg : "var(--border)"}`,
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontSize: "0.85rem",
        fontWeight: 700,
        color: "var(--link)",
        marginTop: "2rem",
        marginBottom: "0.75rem",
      }}
    >
      {children}
    </h3>
  );
}

export function ResumeSection() {
  return (
    <div className="resume-card">
      <h1 style={{ marginBottom: 0, fontSize: "2rem" }}>{resume.name}</h1>
      <p style={{ margin: "0.25rem 0 1rem", opacity: 0.85 }}>
        {resume.title} | {resume.contact.location}
      </p>
      <div className="prose">
        <p>{resume.summary}</p>
      </div>

      <div style={{ marginTop: "0.75rem" }}>
        {resume.coreStrengths.map((strength) => (
          <Pill key={strength.anchorId} anchorId={strength.anchorId} href={`#${strength.anchorId}`}>
            {strength.label}
          </Pill>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginTop: "1.25rem",
        }}
      >
        {resume.stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              flex: "1 1 100px",
              textAlign: "center",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "0.75rem 0.5rem",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--link)" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.75rem", opacity: 0.75 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <p style={{ opacity: 0.85, marginTop: "1.25rem" }}>
        {resume.contact.email} · {resume.contact.linkedin}
      </p>

      <SectionHeading>Experience</SectionHeading>
      {resume.experience.map((job, index) => (
        <div key={`${job.company}-${job.title}`} style={{ display: "flex", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "var(--link)",
                marginTop: 6,
                flexShrink: 0,
              }}
            />
            {index < resume.experience.length - 1 && (
              <div style={{ flex: 1, width: 2, background: "var(--border)" }} />
            )}
          </div>

          <div className="prose" style={{ flex: 1, paddingBottom: "1.5rem" }}>
            <div style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              {job.company}, {job.location}
            </div>

            {job.positions ? (
              <div style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>
                {job.positions.map((position, posIndex) => (
                  <div key={position.title} style={{ display: "flex", gap: "0.6rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "var(--border)",
                          marginTop: 6,
                          flexShrink: 0,
                        }}
                      />
                      {posIndex < job.positions!.length - 1 && (
                        <div style={{ flex: 1, width: 2, background: "var(--border)" }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: "0.5rem" }}>
                      <div style={{ fontWeight: 600 }}>{position.title}</div>
                      <div style={{ opacity: 0.75, fontSize: "0.9rem" }}>
                        {position.start} – {position.end}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ opacity: 0.75, marginBottom: "0.75rem" }}>
                {job.title} · {job.start} – {job.end}
              </div>
            )}

            {job.sections ? (
              job.sections.map((section) => (
                <div key={section.anchorId} id={section.anchorId} style={{ marginBottom: "1rem" }}>
                  <Pill anchorId={section.anchorId}>
                    {section.category}
                    {section.note && ` · ${section.note}`}
                  </Pill>
                  <ul style={{ marginTop: "0.5rem" }}>
                    {section.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <ul>
                {job.highlights?.map((highlight) => <li key={highlight}>{highlight}</li>)}
              </ul>
            )}
          </div>
        </div>
      ))}

      <SectionHeading>AI &amp; Agent Projects</SectionHeading>
      <div className="prose">
        {projects.map((project) => (
          <div key={project.title} style={{ marginBottom: "1rem" }}>
            <strong>{project.title}</strong> — {project.description}
            <ul>
              {project.highlights.map((highlight) => (
                <li key={highlight}>{boldKeyTerms(highlight)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <SectionHeading>Skills</SectionHeading>
      {resume.skills.map((group) => (
        <div key={group.category} style={{ marginBottom: "1rem" }}>
          <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>{group.category}</div>
          <div>
            {group.items.map((item) => (
              <Pill key={item} anchorId={SKILL_CATEGORY_ANCHOR[group.category]}>
                {item}
              </Pill>
            ))}
          </div>
        </div>
      ))}

      <SectionHeading>Education</SectionHeading>
      <div className="prose">
        <ul>
          {resume.education.map((edu) => (
            <li key={`${edu.school}-${edu.degree}`}>
              {edu.degree}, {edu.school} ({edu.start}–{edu.end})
              {edu.detail && ` — ${edu.detail}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
