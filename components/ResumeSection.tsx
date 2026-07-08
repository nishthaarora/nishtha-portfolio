import { resume } from "@/data/resume";

export function ResumeSection() {
  return (
    <div>
      <h1>{resume.name}</h1>
      <h2>{resume.title}</h2>
      <p>{resume.summary}</p>

      <h3>Experience</h3>
      {resume.experience.map((job) => (
        <div key={`${job.company}-${job.title}`}>
          <strong>
            {job.title} — {job.company}
          </strong>{" "}
          ({job.start}–{job.end})
          <ul>
            {job.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
      ))}

      <h3>Education</h3>
      <ul>
        {resume.education.map((edu) => (
          <li key={`${edu.school}-${edu.degree}`}>
            {edu.degree}, {edu.school} ({edu.year})
          </li>
        ))}
      </ul>

      <h3>Skills</h3>
      <p>{resume.skills.join(", ")}</p>
    </div>
  );
}
