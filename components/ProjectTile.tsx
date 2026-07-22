import Link from "next/link";
import type { Project } from "@/data/projects";

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const sliced = text.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced).trimEnd() + "…";
}

export function ProjectTile({ project }: { project: Project }) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      style={{
        display: "block",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
        background: "var(--card-bg)",
        textDecoration: "none",
        color: "var(--fg)",
      }}
    >
      {project.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.thumbnailUrl}
          alt={project.thumbnailAlt ?? `${project.title} thumbnail`}
          style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            background: "var(--input-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.85rem",
            opacity: 0.6,
          }}
        >
          {project.title}
        </div>
      )}
      <div style={{ padding: "1rem" }}>
        <h2 style={{ margin: 0 }}>{project.title}</h2>
        <p style={{ margin: "0.4rem 0 0", opacity: 0.85, fontSize: "0.9rem" }}>
          {truncate(project.description, 110)}
        </p>
      </div>
    </Link>
  );
}
