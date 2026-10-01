"use client";

import { siteConfig } from "@/lib/config";
import { SocialLink } from "@/types";

// Helper SVG icons crafted with crisp vector paths for newsletter/editorial style
function XIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function TelegramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.38-.49 1.04-.75 4.08-1.77 6.81-2.94 8.19-3.51 3.9-1.62 4.71-1.9 5.24-1.91.12 0 .37.03.54.17.14.12.18.28.2.43-.01.07.01.21 0 .37z" />
    </svg>
  );
}

function MailIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function GitHubIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
    </svg>
  );
}

function getIconForSocial(label: string) {
  const lower = label.toLowerCase();
  if (lower === "x" || lower.includes("twitter")) return <XIcon />;
  if (lower.includes("linkedin")) return <LinkedInIcon />;
  if (lower.includes("telegram")) return <TelegramIcon />;
  if (lower.includes("email") || lower.includes("mail")) return <MailIcon />;
  if (lower.includes("github")) return <GitHubIcon />;
  return null;
}

export function HeaderSocials({ socials }: { socials?: SocialLink[] }) {
  const links = socials || siteConfig.socials;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {links.map((social) => {
        const icon = getIconForSocial(social.label);
        if (!icon) return null; // skip blog or non-icon links in the header icon bar

        const isExternal = social.href.startsWith("http");

        return (
          <a
            key={social.label}
            href={social.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            title={`${social.label} (${social.handle || social.href})`}
            aria-label={`${social.label} link`}
            className="w-7 h-7 sm:w-7.5 sm:h-7.5 inline-flex items-center justify-center rounded border border-stone-300/80 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/60 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-50 hover:border-stone-900 dark:hover:border-stone-100 hover:bg-stone-200/90 dark:hover:bg-stone-800 transition-all cursor-pointer shadow-2xs group"
          >
            <span className="transition-transform group-hover:scale-110">
              {icon}
            </span>
          </a>
        );
      })}
    </div>
  );
}
