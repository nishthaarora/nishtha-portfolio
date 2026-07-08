export type ResumeExperience = {
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
};

export type ResumeEducation = {
  school: string;
  degree: string;
  start: string;
  end: string;
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type Resume = {
  name: string;
  title: string;
  contact: {
    phone: string;
    email: string;
    linkedin: string;
    location: string;
  };
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: SkillGroup[];
};

export const resume: Resume = {
  name: "Nishtha Arora",
  title: "Senior Software Engineer",
  contact: {
    phone: "512-960-5457",
    email: "nishtha.arora26@gmail.com",
    linkedin: "linkedin.com/in/nishthaarora",
    location: "TX",
  },
  summary:
    "Senior frontend engineer with 8+ years of experience building scalable React applications, design systems, and developer tooling. Led migration of 80+ components to a new design system, improving UI consistency across multiple product teams. Builds AI-powered agents and automation tools using Claude SDK and LLMs to accelerate developer productivity and code quality. Currently monitoring and driving AI adoption (GitHub Copilot, Cursor) across engineering teams.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Appfire",
      location: "Remote, TX",
      start: "February 2025",
      end: "Present",
      highlights: [
        "Developed an AI Adoption Dashboard tracking GitHub Copilot and Cursor usage, giving leadership visibility into adoption trends and ROI",
        "Led migration of 80+ components from classic design system to Flow design system, improving UI consistency and accelerating development velocity across multiple product teams",
        "Documented 80+ components in Storybook, streamlining design-to-development handoff and reducing onboarding time for new engineers",
        "Mentored 4+ junior and mid-level engineers and defined scalable frontend architecture patterns and coding standards adopted across multiple engineering teams",
        "Led frontend development across concurrent projects, delivering scalable, maintainable solutions on schedule and improving cross-team delivery predictability by ~20%",
        "Unified two design system libraries into a single scalable foundation, reducing design inconsistencies by 40% and improving component reuse across product teams",
        "Streamlined CI/CD pipelines and ArgoCD workflows, reducing deployment failures by 40% and accelerating release reliability across multiple environments",
        "Applied AWS, S3 to support cloud infrastructure and data ingestion workflows, improving data availability and operational efficiency by ~25%",
        "Collaborated on product work to help ship features faster and align engineering delivery with product priorities across the roadmap",
      ],
    },
    {
      title: "Senior React Engineer",
      company: "Pluralsight",
      location: "Remote",
      start: "September 2020",
      end: "February 2025",
      highlights: [
        "Architected a shared React component library adopted across 10+ product teams, accelerating development speed and improving UI consistency at scale",
        "Implemented Cypress-based integration testing, enhancing test coverage by 85% and improving CI/CD pipeline stability",
        "Delivered customer-facing features that drove a 15% increase in product adoption across key user workflows",
        "Synthesized feedback from 20+ customer calls to align feature development with user needs and strengthen engineering-product strategy",
        "Resolved 100+ bugs ahead of SLA deadlines, improving team delivery metrics and customer satisfaction",
        "Transformed image-based email reporting system to a React-based solution, boosting email content quality and control by 90%",
      ],
    },
    {
      title: "Frontend Engineer",
      company: "Match Group",
      location: "Dallas, TX",
      start: "June 2017",
      end: "September 2020",
      highlights: [
        "Developed consumer-facing features for a high-traffic dating platform serving 10M+ users, supporting reliable and engaging web experiences at scale",
        "Created reusable UI components and advanced the internal design system, improving development consistency across 4+ engineering teams",
        "Partnered with UX and product teams to deliver accessible, performant, responsive web experiences, improving page usability and load performance by ~20%",
        "Advanced A/B testing frameworks and analytics instrumentation to measure feature impact and inform product decisions across high-traffic user journeys",
      ],
    },
  ],
  education: [
    {
      school: "Institute of Marketing and Management, India",
      degree: "MBA, Finance & Marketing",
      start: "September 2008",
      end: "November 2010",
    },
    {
      school: "IP University, India",
      degree: "BBA",
      start: "August 2005",
      end: "August 2008",
    },
  ],
  skills: [
    { category: "Frontend", items: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Next.js", "Redux", "GraphQL"] },
    { category: "AI & Agents", items: ["Claude SDK", "LLM Prompt Engineering", "AI Agent Development", "AWS Bedrock", "Claude Sonnet 4.6", "Amazon Titan Embeddings", "RAG Pipelines", "Agentic Tool Calling", "MCP", "FastMCP", "ChromaDB", "LangChain Text Splitters"] },
    { category: "Testing & Observability", items: ["Cypress", "Playwright", "React Testing Library", "Datadog (RUM)", "Jest"] },
    { category: "Backend / Platform", items: ["Node.js", "FastAPI", "REST APIs", "GraphQL APIs", "AWS", "S3", "Bedrock", "ArgoCD", "SQL"] },
    { category: "Tools & Platform", items: ["Git", "GitHub", "CI/CD", "GitHub Actions", "Figma", "Storybook", "Jira", "Docker"] },
    { category: "Languages", items: ["TypeScript", "JavaScript", "Python", "HTML", "CSS"] },
  ],
};
