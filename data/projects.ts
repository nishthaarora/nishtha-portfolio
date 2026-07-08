export type Project = {
  title: string;
  description: string;
  tech: string[];
  link?: string;
};

export const projects: Project[] = [
  {
    title: "Replace with a project title",
    description: "Replace with a 1-2 sentence description of the project.",
    tech: ["TypeScript", "Next.js"],
    link: "https://github.com/nishthaarora",
  },
];
