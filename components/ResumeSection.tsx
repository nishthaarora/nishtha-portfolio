import Image from "next/image";
import { resume } from "@/data/resume";
import { projects } from "@/data/projects";
import { Pill } from "@/components/Pill";
import { boldKeyTerms } from "@/lib/boldKeyTerms";

const SKILL_CATEGORY_COLOR: Record<string, string> = {
  Frontend: "frontend-engineering",
  "AI & Automation": "ai-agent-development",
  Leadership: "team-leadership",
  "Testing & Observability": "testing",
  Platform: "platform",
};

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
      <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
        <Image
          src="/headshot.jpg"
          alt={resume.name}
          width={64}
          height={64}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0 0 0 3px var(--link)",
          }}
        />
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>{resume.name}</h1>
          <p style={{ margin: "0.25rem 0 0", opacity: 0.85 }}>
            {resume.title} | {resume.contact.location}
          </p>
        </div>
      </div>

      <div className="prose" style={{ marginTop: "1rem" }}>
        <p>{resume.summary}</p>
      </div>

      <div style={{ marginTop: "0.75rem" }}>
        {resume.coreStrengths.map((strength) => (
          <Pill key={strength.anchorId} colorKey={strength.anchorId} href={`#${strength.anchorId}`}>
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
        <a href={`mailto:${resume.contact.email}`}>{resume.contact.email}</a> ·{" "}
        <a href={`https://${resume.contact.linkedin}`} target="_blank" rel="noreferrer">
          {resume.contact.linkedin}
        </a>
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
                  <Pill colorKey={section.anchorId}>
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
              <Pill key={item} colorKey={SKILL_CATEGORY_COLOR[group.category]}>
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
