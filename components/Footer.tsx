import { resume } from "@/data/resume";

export function Footer() {
  return (
    <footer
      style={{
        padding: "1.5rem",
        borderTop: "1px solid var(--border)",
        textAlign: "center",
      }}
    >
      <a href={`mailto:${resume.contact.email}`}>{resume.contact.email}</a>
      {" · "}
      <a href={`https://${resume.contact.linkedin}`} target="_blank" rel="noreferrer">
        LinkedIn
      </a>
    </footer>
  );
}
