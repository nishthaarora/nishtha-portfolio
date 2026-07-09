import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/ProjectCard";

export const metadata = {
  title: "Portfolio",
  description: "Projects built by Nishtha Arora, including AI agents and developer tooling.",
};

export default function PortfolioPage() {
  return (
    <div>
      <h1>Projects</h1>
      <div style={{ display: "grid", gap: "1rem" }}>
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </div>
  );
}
