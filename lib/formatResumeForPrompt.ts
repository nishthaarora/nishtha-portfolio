import { resume } from "@/data/resume";
import { projects } from "@/data/projects";

export function formatResumeForPrompt(): string {
  const experience = resume.experience
    .map((job) => {
      const header =
        `- ${job.title} at ${job.company} (${job.start}–${job.end}, ${job.location})` +
        (job.promotionNote ? ` [${job.promotionNote}]` : "");

      if (job.sections) {
        const sections = job.sections
          .map(
            (section) =>
              `  - ${section.category}${section.note ? ` (${section.note})` : ""}:\n` +
              section.highlights.map((h) => `    - ${h}`).join("\n")
          )
          .join("\n");
        return `${header}\n${sections}`;
      }

      return `${header}\n${(job.highlights ?? []).map((h) => `  - ${h}`).join("\n")}`;
    })
    .join("\n");

  const education = resume.education
    .map(
      (edu) =>
        `- ${edu.degree}, ${edu.school} (${edu.start}–${edu.end})` +
        (edu.detail ? ` — ${edu.detail}` : "")
    )
    .join("\n");

  const skills = resume.skills
    .map((group) => `- ${group.category}: ${group.items.join(", ")}`)
    .join("\n");

  const projectsSection = projects
    .map(
      (project) =>
        `- ${project.title}: ${project.description}\n` +
        project.highlights.map((h) => `  - ${h}`).join("\n") +
        `\n  - Tech: ${project.tech.join(", ")}`
    )
    .join("\n");

  return [
    `# ${resume.name} — ${resume.title}`,
    "",
    resume.summary,
    "",
    "## Experience",
    experience,
    "",
    "## Personal Projects",
    projectsSection,
    "",
    "## Education",
    education,
    "",
    "## Skills",
    skills,
  ].join("\n");
}
