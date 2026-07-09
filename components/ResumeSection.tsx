import { resume } from "@/data/resume";
import { projects } from "@/data/projects";

export function ResumeSection() {
  return (
    <div>
      <h1 style={{ marginBottom: 0 }}>{resume.name}</h1>
      <p style={{ margin: "0.25rem 0 1rem", opacity: 0.85 }}>
        {resume.title} | {resume.contact.location}
      </p>
      <p>{resume.summary}</p>

      <p>
        <strong>Core strengths: </strong>
        {resume.coreStrengths.map((strength, index) => (
          <span key={strength.anchorId}>
            {index > 0 && " · "}
            <a href={`#${strength.anchorId}`}>{strength.label}</a>
          </span>
        ))}
      </p>

      <p style={{ opacity: 0.85 }}>
        {resume.contact.email} · {resume.contact.linkedin}
      </p>

      <h3>Experience</h3>
      {resume.experience.map((job) => (
        <div key={`${job.company}-${job.title}`} style={{ marginBottom: "1.25rem" }}>
          <strong>
            {job.title} — {job.company}, {job.location}
          </strong>
          <br />
          <span style={{ opacity: 0.75 }}>
            {job.start} – {job.end}
            {job.promotionNote && ` (${job.promotionNote})`}
          </span>

          {job.sections ? (
            job.sections.map((section) => (
              <div key={section.anchorId} id={section.anchorId} style={{ marginTop: "0.75rem" }}>
                <strong>
                  {section.category}
                  {section.note && ` (${section.note})`}
                </strong>
                <ul>
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
      ))}

      <h3>AI & Agent Projects</h3>
      {projects.map((project) => (
        <div key={project.title} style={{ marginBottom: "1rem" }}>
          <strong>{project.title}</strong> — {project.description}
          <ul>
            {project.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
      ))}

      <h3>Skills</h3>
      {resume.skills.map((group) => (
        <p key={group.category}>
          <strong>{group.category}:</strong> {group.items.join(", ")}
        </p>
      ))}

      <h3>Education</h3>
      <ul>
        {resume.education.map((edu) => (
          <li key={`${edu.school}-${edu.degree}`}>
            {edu.degree}, {edu.school} ({edu.start}–{edu.end})
            {edu.detail && ` — ${edu.detail}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
