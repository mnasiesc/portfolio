"use client";

// ─── ContactSection — Client Component ──────────────────────────────────────
// Direct contact section with one-click email copy & social links.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Copy, Check, ExternalLink, Mail } from "lucide-react";
import { SocialLink } from "@/types";

interface ContactSectionProps {
  socials: SocialLink[];
}

export function ContactSection({ socials }: ContactSectionProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const emailSocial = socials.find((s) => s.label.toLowerCase().includes("email"));
  const emailAddress = emailSocial?.handle || "hello@mnasie.dev";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  return (
    <section id="contact" className="py-12 sm:py-16 border-t border-stone-300/70 dark:border-stone-800">
      {/* Section Header */}
      <div className="mb-8 pb-3 border-b-2 border-stone-900 dark:border-stone-100">
        <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Contact
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Email Box */}
        <div className="lg:col-span-7 space-y-4">
          <p className="text-stone-700 dark:text-stone-300 text-base leading-relaxed font-sans">
            Open to engineering roles, low-level systems projects, and technical collaboration.
          </p>

          {/* Email Copy Box */}
          <div className="p-5 rounded-lg bg-stone-200/50 dark:bg-stone-900/60 border border-stone-300/80 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-stone-300/60 dark:bg-stone-800 text-stone-900 dark:text-stone-100">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-mono text-[11px] text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Email
                </div>
                <div className="font-mono text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 select-all break-all sm:break-normal">
                  {emailAddress}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyEmail}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-mono text-xs font-bold tracking-wider uppercase hover:opacity-90 transition-all active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  COPIED!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  COPY EMAIL
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Social Links */}
        <div className="lg:col-span-5 space-y-3">
          <div className="font-mono text-xs text-stone-600 dark:text-stone-400 tracking-widest uppercase mb-1">
            Links
          </div>

          <div className="space-y-2">
            {socials.map((social) => {
              const isExternal = social.href.startsWith("http");
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="group flex items-center justify-between p-3.5 rounded-md border border-stone-300/60 dark:border-stone-800 bg-stone-100/40 dark:bg-stone-900/40 hover:border-stone-900 dark:hover:border-stone-100 transition-all no-underline"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 group-hover:underline decoration-stone-400 underline-offset-4">
                      {social.label}
                    </span>
                    {social.handle && (
                      <span className="font-mono text-xs text-stone-600 dark:text-stone-400">
                        ({social.handle})
                      </span>
                    )}
                  </div>

                  <ExternalLink className="w-4 h-4 text-stone-600 dark:text-stone-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
