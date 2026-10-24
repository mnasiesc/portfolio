"use client";
// ─── Why "use client" here? ───────────────────────────────────────────────────
// `usePathname()` is a React hook that reads the current browser URL.
// Hooks can only run in the browser (they need a live React runtime).
// Adding "use client" at the top tells Next.js:
//   "Compile this component for the browser, include it in the JS bundle."
//
// Without "use client", this would be a Server Component — which runs only
// on the server and can't use hooks or event listeners.
//
// The key rule: keep the "use client" boundary as SMALL as possible.
// That's why we isolate just the nav links here instead of making the
// whole Header a Client Component.
//
// Vanilla JS analogy: this is the equivalent of a small script block
// that runs on page load and adds/removes an "active" class from nav links.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import type { NavItem } from "@/types";

// ─── Props interface ──────────────────────────────────────────────────────────
// This component accepts an array of NavItem objects.
// It doesn't care WHERE that data comes from — config file, CMS, API, etc.
// That's the decoupling: the UI and the data are completely independent.
interface NavLinksProps {
  items: NavItem[];
  ariaLabel: string;
}

export function NavLinks({ items, ariaLabel }: NavLinksProps) {
  const pathname = usePathname();
  const hash = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("hashchange", onChange);
      window.addEventListener("popstate", onChange);
      return () => {
        window.removeEventListener("hashchange", onChange);
        window.removeEventListener("popstate", onChange);
      };
    },
    () => window.location.hash,
    () => "",
  );

  return (
    <nav aria-label={ariaLabel}>
      <ul className="station-nav-list">
        {items.map((item) => {
          const [hrefPath, hrefHash] = item.href.split("#");
          const targetPath = hrefPath || "/";
          const isActive = pathname === targetPath && (hrefHash ? hash === `#${hrefHash}` : true);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                // `cn()` merges class names cleanly — handles conditional classes
                // without messy template literal ternaries everywhere.
                // Active links get a full ink underline; inactive get a hover reveal.
                className={[
                  "station-nav-link",
                  isActive
                    ? "is-active"
                    : "",
                ].join(" ")}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
