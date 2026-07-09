export type ExperienceSection = {
  category: string;
  anchorId: string;
  note?: string;
  highlights: string[];
};

export type Position = {
  title: string;
  start: string;
  end: string;
};

export type ResumeExperience = {
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  positions?: Position[];
  sections?: ExperienceSection[];
  highlights?: string[];
};

export type ResumeEducation = {
  school: string;
  degree: string;
  start: string;
  end: string;
  detail?: string;
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type CoreStrength = {
  label: string;
  anchorId: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type Resume = {
  name: string;
  title: string;
  contact: {
    email: string;
    linkedin: string;
    location: string;
  };
  summary: string;
  coreStrengths: CoreStrength[];
  stats: Stat[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: SkillGroup[];
};

export const resume: Resume = {
  name: "Nishtha Arora",
  title: "Senior Software Engineer",
  contact: {
    email: "nishtha.arora26@gmail.com",
    linkedin: "linkedin.com/in/nishthaarora",
    location: "Frisco, TX",
  },
  summary:
    "Senior Software Engineer with 8+ years building scalable frontend platforms and, more recently, AI-native developer tooling and agentic systems. Experience spans architecting shared React design systems, building production RAG pipelines and tool-calling agents on AWS Bedrock, and stepping in as acting manager, taking on sprint planning, cross-functional ownership, and mentoring.",
  coreStrengths: [
    { label: "Frontend Engineering", anchorId: "frontend-engineering" },
    { label: "AI & Agent Development", anchorId: "ai-agent-development" },
    { label: "Team Leadership", anchorId: "team-leadership" },
  ],
  stats: [
    { value: "8+", label: "years experience" },
    { value: "84", label: "components migrated" },
    { value: "3+", label: "teams served" },
    { value: "85%", label: "critical-path test coverage" },
    { value: "4x", label: "fewer deploy failures" },
  ],
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Appfire",
      location: "Remote, TX",
      start: "February 2025",
      end: "Present",
      sections: [
        {
          category: "Team Leadership",
          anchorId: "team-leadership",
          highlights: [
            "Stepped in as acting manager, owning sprint planning, backlog grooming, and retrospectives, driving team execution rhythm and surfacing technical risk early",
            "Serve as the primary cross-functional point of contact with product and design, aligning feature scope and roadmap phases with engineering capacity",
            "Coach junior engineers through structured growth paths, helping translate mentoring into measurable progress toward more senior scope",
          ],
        },
        {
          category: "AI & Agent Development",
          anchorId: "ai-agent-development",
          highlights: [
            "Built the full RAG pipeline for the team's Flow AI agent: LangChain document ingestion and chunking, Amazon Titan embeddings via Bedrock, ChromaDB vector store, and semantic retrieval; evaluated retrieval quality across chunk sizes, embedding strategies, and similarity thresholds before shipping",
            "Implemented the agentic backend in FastAPI with two-round-trip Bedrock tool calling (RAG retrieval + ticket-creation tool) and a FastMCP stdio server exposing the agent as an MCP-compatible service for Claude Code and other clients",
            "Built a PR review agent on the Claude SDK running as a daemon triggered by GitHub notifications, leaving inline, recommendation-only comments; supports Claude, Gemini, and Cursor as drop-in AI providers",
            "Built an AI Adoption Dashboard tracking GitHub Copilot and Cursor usage org-wide, giving leadership visibility into AI tooling adoption and ROI",
          ],
        },
        {
          category: "Frontend Engineering",
          anchorId: "frontend-engineering",
          highlights: [
            "Set React/TypeScript architecture patterns and led migration of 84 components into a unified design system (Flow), documented in Storybook; mentored 3 engineers",
            "Streamlined CI/CD pipelines and ArgoCD workflows, cutting deployment failures from weekly to roughly once a month",
            "Applied AWS/S3 to cloud infrastructure and data ingestion workflows, improving data availability",
          ],
        },
      ],
    },
    {
      title: "Senior Software Engineer",
      company: "Pluralsight",
      location: "Remote",
      start: "September 2020",
      end: "February 2025",
      positions: [
        { title: "Senior Software Engineer", start: "January 2024", end: "February 2025" },
        { title: "Frontend Developer", start: "September 2020", end: "January 2024" },
      ],
      highlights: [
        "Architected and owned the shared React component library used across 3+ teams",
        "Rolled out Datadog RUM to establish real performance baselines across the platform, shifting the team from guesswork to data-driven decisions",
        "Wrote and championed Cypress integration tests, growing critical-path coverage from near zero to roughly 85%",
        "Led a customer-facing onboarding revamp attributed with a ~15% lift in product adoption; cleared a backlog of 100+ bugs ahead of SLA deadlines",
      ],
    },
    {
      title: "Frontend Developer",
      company: "Match Group",
      location: "Dallas, TX",
      start: "June 2017",
      end: "September 2020",
      highlights: [
        "Built the user messaging system end-to-end using GraphQL (schema design, real-time subscriptions, React UI layer) for a consumer product with millions of daily users",
        "Advanced A/B testing and analytics instrumentation across high-traffic user journeys; contributed to the org-wide internal design system",
      ],
    },
  ],
  education: [
    {
      school: "The University of Texas at Austin",
      degree: "Coding Bootcamp, Computer Programming",
      start: "2016",
      end: "2017",
      detail: "HTML, CSS, JavaScript, Node.js, Express, React, Angular, MongoDB",
    },
    {
      school: "Institute of Marketing and Management, India",
      degree: "MBA, Finance & Marketing",
      start: "2008",
      end: "2010",
    },
    {
      school: "IP University, India",
      degree: "BBA",
      start: "2005",
      end: "2008",
    },
  ],
  skills: [
    {
      category: "Leadership",
      items: [
        "Mentoring",
        "Sprint Planning & Grooming",
        "Cross-Functional Communication",
        "Growth Coaching",
        "Architecture Standards",
        "Agile/SDLC",
      ],
    },
    {
      category: "AI & Automation",
      items: [
        "AWS Bedrock (Claude Sonnet 4.6, Titan)",
        "RAG Pipelines",
        "Agentic Tool Calling",
        "MCP / FastMCP",
        "ChromaDB",
        "LangChain",
        "Claude SDK",
        "Prompt Engineering",
        "LLM Evaluation",
      ],
    },
    {
      category: "Frontend",
      items: ["React", "TypeScript", "JavaScript", "Next.js", "Redux", "GraphQL", "HTML5", "CSS3"],
    },
    {
      category: "Testing & Observability",
      items: ["Cypress", "Playwright", "React Testing Library", "Jest", "Datadog RUM", "Storybook"],
    },
    {
      category: "Platform",
      items: [
        "Node.js",
        "Python",
        "Django",
        "FastAPI",
        "PostgreSQL",
        "AWS (S3, Lambda, Bedrock)",
        "Docker",
        "ArgoCD",
        "GitHub Actions",
        "SQL",
      ],
    },
  ],
};
