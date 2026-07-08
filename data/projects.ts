export type Project = {
  title: string;
  description: string;
  highlights: string[];
  tech: string[];
  link?: string;
};

export const projects: Project[] = [
  {
    title: "AI Operations Agent",
    description:
      "A full-stack AI agent built to learn and mirror production RAG patterns, built alongside studying a production Strands Agents + S3 Vectors system at work to understand every architectural decision by building a working equivalent.",
    highlights: [
      "RAG pipeline: LangChain text splitters for chunking, Amazon Titan embeddings via Bedrock, ChromaDB as the local vector store — full document ingestion and semantic retrieval",
      "Agent with tool calling: two-round-trip Bedrock format (initial call → tool invocation → second call with results). Two tools: search_docs (RAG retrieval) and create_ticket (mock Jira stub)",
      "FastAPI backend with streaming responses; React chat frontend with real-time message rendering",
      "FastMCP stdio server — exposes the agent as an MCP-compatible tool for use with Claude Code or any MCP client",
    ],
    tech: ["Python", "FastAPI", "React", "AWS Bedrock", "ChromaDB", "LangChain", "MCP"],
  },
  {
    title: "PR Review Agent",
    description:
      "A daemon process that monitors GitHub notifications and automatically reviews eligible pull requests on each event.",
    highlights: [
      "Invokes Claude Code CLI as the AI provider; supports Gemini and Cursor as drop-in alternatives via config",
      "Leaves inline PR comments — recommendations only, no approvals or blocks",
      "Configurable: branch skip lists, ignored authors, polling interval, permission mode",
    ],
    tech: ["Python", "Claude SDK", "GitHub API"],
  },
];
