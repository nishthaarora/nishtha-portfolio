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
      <h1>{project.title}</h1>
      <p>{project.description}</p>

      {project.videoUrl && (
        <div style={{ margin: "1rem 0" }}>
          <video
            src={project.videoUrl}
            controls
            preload="metadata"
            poster={project.thumbnailUrl}
            style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border)" }}
          />
          {project.videoCaption && (
            <p style={{ opacity: 0.75, fontSize: "0.85rem", marginTop: "0.4rem" }}>
              {project.videoCaption}
            </p>
          )}
        </div>
      )}

      {!project.videoUrl && project.thumbnailUrl && (
        <div style={{ margin: "1rem 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.thumbnailUrl}
            alt={project.thumbnailAlt ?? `${project.title} architecture diagram`}
            style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border)" }}
          />
        </div>
      )}

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
