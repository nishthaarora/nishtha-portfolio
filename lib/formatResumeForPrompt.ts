import { resume } from "@/data/resume";

export function formatResumeForPrompt(): string {
  const experience = resume.experience
    .map(
      (job) =>
        `- ${job.title} at ${job.company} (${job.start}–${job.end})\n` +
        job.highlights.map((h) => `  - ${h}`).join("\n")
    )
    .join("\n");

  const education = resume.education
    .map((edu) => `- ${edu.degree}, ${edu.school} (${edu.year})`)
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
    resume.skills.join(", "),
  ].join("\n");
}
