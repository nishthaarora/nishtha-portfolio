import { projects } from "@/data/projects";
import { ProjectTile } from "@/components/ProjectTile";

export const metadata = {
  title: "Portfolio",
  description: "Projects built by Nishtha Arora, including AI agents and developer tooling.",
};

export default function PortfolioPage() {
  return (
    <div>
      <h1>Projects</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {projects.map((project) => (
          <ProjectTile key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
