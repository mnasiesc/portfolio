// ─── Header — Server Component ────────────────────────────────────────────────
// No "use client" here — this runs on the server and produces static HTML.
// It reads validated portfolio data and renders the masthead structure.
//
// The only interactive part (active link highlighting) is delegated to
// <NavLinks />, which is a small Client Component boundary.
//
// To change the header design entirely: edit ONLY this file.
// The nav data comes from the JSON-backed portfolio content.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { portfolio } from "@/lib/portfolio";
import { NavLinks } from "@/components/layout/NavLinks";
import { HeaderSocials } from "@/components/layout/HeaderSocials";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ViewSwitcher } from "@/components/layout/ViewSwitcher";
import { getAvailabilityClass } from "@/lib/status";

export function Header() {
  const availClass = getAvailabilityClass(portfolio.home.availability);

  return (
    <header className="station-header sticky top-0 z-50">
      <div className="station-header-status">
        <span className={`station-status-light ${availClass}`} aria-hidden="true" />
        <span className={`station-status-text ${availClass}`}>{portfolio.home.availability}</span>
        <span className="station-status-divider" aria-hidden="true" />
        <span>{portfolio.site.issueLabel}</span>
      </div>
      <div className="station-header-inner">
        <Link
          href="/"
          className="station-brand no-underline"
          aria-label={`${portfolio.site.name} — ${portfolio.writing.homeAriaLabel}`}
        >
          <span className="station-brand-name">{portfolio.site.name}</span>
          <span className="station-brand-role">{portfolio.site.role}</span>
        </Link>
        <div className="station-header-controls">
          <NavLinks items={portfolio.navigation} ariaLabel={portfolio.writing.primaryNavigationLabel} />
          <ViewSwitcher
            terminalLabel={portfolio.terminal.navLabel}
            visualLabel={portfolio.terminal.switchToVisualLabel}
          />
          <div className="station-socials">
            <HeaderSocials socials={portfolio.socials} ariaSuffix={portfolio.writing.socialLinkAriaSuffix} />
          </div>
          <ThemeToggle labels={portfolio.writing} />
        </div>
      </div>
      <div className="station-header-mobile-socials">
        <HeaderSocials socials={portfolio.socials} ariaSuffix={portfolio.writing.socialLinkAriaSuffix} />
      </div>
    </header>
  );
}
