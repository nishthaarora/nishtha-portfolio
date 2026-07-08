import type { Project } from "@/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: "1rem" }}>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <p>{project.tech.join(", ")}</p>
      {project.link && (
        <a href={project.link} target="_blank" rel="noreferrer">
          View project
        </a>
      )}
    </div>
  );
}
