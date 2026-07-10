export type Project = {
  slug: string;
  title: string;
  description: string;
  highlights: string[];
  tech: string[];
  link?: string;
  videoUrl?: string;
  videoCaption?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
};

export const projects: Project[] = [
  {
    slug: "nexus-hr-agent",
    title: "Nexus HR Agent",
    description:
      "An AI-powered internal operations assistant built with AWS Bedrock, RAG, and FastAPI. Ask questions about company documentation or create support tickets — the agent routes your request to the right skill automatically. Built to learn and mirror production RAG + agentic patterns, alongside studying a production Strands Agents + S3 Vectors system at work to understand every architectural decision by building a working equivalent.",
    highlights: [
      "RAG pipeline over fictional company documentation: LangChain chunking, Amazon Titan embeddings via Bedrock, ChromaDB as the vector store — full document ingestion and semantic retrieval",
      "Agent with tool calling: two-round-trip Bedrock format (initial call → tool invocation → second call with results). Two tools: search_docs (RAG retrieval) and create_ticket (support ticket creation)",
      "Intent-based skill routing (documentation vs. support), stateful multi-turn conversations with session persistence, and conversation summarization for long sessions",
      "FastAPI backend; Next.js + React + TypeScript + Tailwind chat frontend",
      "FastMCP stdio server — exposes the agent as an MCP-compatible tool for use with Claude Code or any MCP client",
      "LLM-as-judge evaluation pipeline for measuring retrieval and response quality",
    ],
    tech: ["Python", "FastAPI", "Next.js", "React", "AWS Bedrock", "ChromaDB", "LangChain", "MCP"],
    link: "https://github.com/nishthaarora/nexus-hr-agent",
    videoUrl: "https://pub-2706fb31198a415faeb07fa6f7006249.r2.dev/evals.mp4",
    videoCaption: "Live eval suite — 12 test cases scored against the RAG pipeline",
    thumbnailUrl: "/nexus-hr-agent-architecture.png",
    thumbnailAlt: "Nexus HR Agent architecture: chat UI to FastAPI, intent routing, RAG pipeline and ticket tool, Bedrock Converse API, MCP exposure and eval pipeline",
  },
  {
    slug: "pr-review-agent",
    title: "PR Review Agent",
    description:
      "A daemon process that monitors GitHub notifications and automatically reviews eligible pull requests on each event.",
    highlights: [
      "Invokes Claude Code CLI as the AI provider; supports Gemini and Cursor as drop-in alternatives via config",
      "Leaves inline PR comments — recommendations only, no approvals or blocks",
      "Configurable: branch skip lists, ignored authors, polling interval, permission mode",
    ],
    tech: ["Python", "Claude SDK", "GitHub API"],
    thumbnailUrl: "/pr-review-agent-architecture.png",
    thumbnailAlt: "PR Review Agent architecture: GitHub notifications to polling daemon, eligibility filter, pluggable AI provider, code review analysis, and inline PR comments",
  },
];
