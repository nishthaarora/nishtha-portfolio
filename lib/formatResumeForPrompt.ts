import { resume } from "@/data/resume";

export function formatResumeForPrompt(): string {
  const experience = resume.experience
    .map(
      (job) =>
        `- ${job.title} at ${job.company} (${job.start}–${job.end}, ${job.location})\n` +
        job.highlights.map((h) => `  - ${h}`).join("\n")
    )
    .join("\n");

  const education = resume.education
    .map((edu) => `- ${edu.degree}, ${edu.school} (${edu.start}–${edu.end})`)
    .join("\n");

  const skills = resume.skills
    .map((group) => `- ${group.category}: ${group.items.join(", ")}`)
    .join("\n");

  return [
    `# ${resume.name} — ${resume.title}`,
    "",
    resume.summary,
    "",
    "## Experience",
    experience,
    "",
    "## Education",
    education,
    "",
    "## Skills",
    skills,
  ].join("\n");
}
