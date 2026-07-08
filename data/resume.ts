export type ResumeExperience = {
  title: string;
  company: string;
  start: string;
  end: string;
  highlights: string[];
};

export type ResumeEducation = {
  school: string;
  degree: string;
  year: string;
};

export type Resume = {
  name: string;
  title: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
};

export const resume: Resume = {
  name: "Nishtha Arora",
  title: "Software Engineer",
  summary:
    "Replace with a short 2-3 sentence summary of your background and focus areas.",
  experience: [
    {
      title: "Replace with your job title",
      company: "Replace with company name",
      start: "2023",
      end: "Present",
      highlights: [
        "Replace with a specific accomplishment or responsibility.",
        "Replace with another one.",
      ],
    },
  ],
  education: [
    {
      school: "Replace with your school",
      degree: "Replace with your degree",
      year: "2023",
    },
  ],
  skills: ["TypeScript", "React", "Node.js"],
};
