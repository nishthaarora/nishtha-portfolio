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
    <nav>
      <ul style={{ display: "flex", gap: "1rem", listStyle: "none", padding: 0 }}>
        {TABS.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              style={{
                fontWeight: pathname === tab.href ? "bold" : "normal",
              }}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
