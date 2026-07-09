import type { Project } from "@/data/projects";
import { Pill } from "@/components/Pill";
import { boldKeyTerms } from "@/lib/boldKeyTerms";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "1rem",
        background: "var(--card-bg)",
      }}
    >
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <ul>
        {project.highlights.map((highlight) => (
          <li key={highlight}>{boldKeyTerms(highlight)}</li>
        ))}
      </ul>
      <div>
        {project.tech.map((tech) => (
          <Pill key={tech}>{tech}</Pill>
        ))}
      </div>
      {project.link ? (
        <a href={project.link} target="_blank" rel="noreferrer">
          View code →
        </a>
      ) : (
        <p style={{ opacity: 0.75, fontStyle: "italic" }}>
          Private repository — happy to walk through the code on a call.
        </p>
      )}
    </div>
  );
}
