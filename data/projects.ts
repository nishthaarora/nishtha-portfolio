export type Project = {
  slug: string;
  title: string;
  description: string;
  highlights: string[];
  tech: string[];
  link?: string;
  videos?: { url: string; caption: string }[];
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
    videos: [
      {
        url: "https://pub-2706fb31198a415faeb07fa6f7006249.r2.dev/nexus_hr_demo.mp4",
        caption: "Product demo — the chat agent handling documentation Q&A and ticket creation",
      },
      {
        url: "https://pub-2706fb31198a415faeb07fa6f7006249.r2.dev/evals.mp4",
        caption: "How I validated it — live eval suite, 12 test cases scored against the RAG pipeline",
      },
    ],
    thumbnailUrl: "/nexus-hr-agent-architecture.png",
    thumbnailAlt: "Nexus HR Agent architecture: chat UI to FastAPI, intent routing, RAG pipeline and ticket tool, Bedrock Converse API, MCP exposure and eval pipeline",
  },
  {
    slug: "pr-deep-review-bot",
    title: "PR Deep Review Bot",
    description:
      "A multi-agent deep PR reviewer that catches cross-file breakage, security vulnerabilities, convention violations, test gaps, and dependency issues that single-pass reviewers miss. Built with claude-agent-sdk as a 3-phase pipeline: triage, parallel specialist analysis, and synthesis.",
    highlights: [
      "3-phase pipeline: Triage (haiku, classifies risk and picks specialists) → Specialists (sonnet, run in parallel: cross-file breakage, security, architecture, test gaps, dependencies) → Synthesis (haiku, dedups and formats findings)",
      "Confidence scoring: every finding gets a 0-100 score, with configurable per-category thresholds to filter noise",
      "Dedup against existing PR comments using semantic matching, not just string comparison",
      "Per-repo learnings stored in JSON — specialists receive past findings as context to avoid re-flagging known issues",
      "GitHub Action triggers: on-demand via PR comment, or automatic on PR open/synchronize above a configurable changed-files threshold",
      "External, versioned prompt templates — editable without code changes",
    ],
    tech: ["Python", "Claude SDK", "GitHub API", "Typer", "Pydantic"],
    link: "https://github.com/nishthaarora/pr-deep-review-bot",
  },
  {
    slug: "pr-review-bot",
    title: "PR Review Bot",
    description:
      "A fully local AI PR review bot powered by Ollama — reviews pull requests from any GitHub repository without sending code to a cloud API. Built to explore what a private, self-hosted code review agent looks like end to end.",
    highlights: [
      "Runs entirely locally via Ollama (deepseek-coder / qwen2.5-coder) — no code leaves the machine",
      "Priority scoring across severity tiers (critical/high/medium/low/style) with configurable minimum-severity filtering to reduce noise",
      "Parallel file processing and incremental review support for faster turnaround on large PRs",
      "Streaming responses from the model as review comments are generated",
      "Simple CLI: point it at any owner/repo and PR number to review",
    ],
    tech: ["Node.js", "Express", "Ollama", "ChromaDB", "GitHub API"],
    link: "https://github.com/nishthaarora/pr-review-bot",
  },
];
