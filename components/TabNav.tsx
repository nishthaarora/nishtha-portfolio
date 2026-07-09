"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/ask", label: "Ask" },
  { href: "/resume", label: "Resume" },
  { href: "/portfolio", label: "Portfolio" },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main">
      <ul style={{ display: "flex", gap: "0.75rem", listStyle: "none", padding: 0, margin: 0 }}>
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                style={{
                  display: "inline-block",
                  padding: "0.4rem 1rem",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: isActive ? "var(--link)" : "var(--card-bg)",
                  color: isActive ? "#ffffff" : "var(--fg)",
                  fontWeight: isActive ? "bold" : "normal",
                  textDecoration: "none",
                }}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
