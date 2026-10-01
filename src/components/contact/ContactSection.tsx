"use client";

// ─── ContactSection — Client Component ──────────────────────────────────────
// Interactive contact section with tactile newspaper broadsheet styling,
// email copy-to-clipboard feedback, and social link cards.
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
    <section id="contact" className="py-16 sm:py-24 border-t border-stone-300/70 dark:border-stone-800">
      {/* Broadsheet Section Header */}
      <div className="mb-12 pb-4 border-b-2 border-stone-900 dark:border-stone-100">
        <div className="font-mono text-xs tracking-widest uppercase text-stone-600 dark:text-stone-400 mb-1">
          SECTION 03 // DIRECT DISPATCH & CORRESPONDENCE
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Get in <span className="italic font-normal">Touch</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Editorial Statement & Copy Button */}
        <div className="lg:col-span-7 space-y-6">
          <p className="font-serif italic text-2xl sm:text-3xl text-stone-800 dark:text-stone-200 border-l-4 border-stone-900 dark:border-stone-100 pl-6 py-2 leading-snug">
            &ldquo;The best technical work starts with an open, thoughtful conversation.&rdquo;
          </p>

          <p className="text-stone-700 dark:text-stone-300 text-base sm:text-lg leading-relaxed font-sans">
            Whether you want to talk systems programming, C++, storage engine architectures, or collaborate on open-source software, my inbox is always open.
          </p>

          {/* Email Copy Card */}
          <div className="p-6 rounded-lg bg-stone-200/50 dark:bg-stone-900/60 border border-stone-300/80 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded bg-stone-300/60 dark:bg-stone-800 text-stone-900 dark:text-stone-100">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-mono text-[11px] text-stone-600 dark:text-stone-400 tracking-wider uppercase">
                  DIRECT EMAIL ADDRESS
                </div>
                <div className="font-mono text-base font-bold text-stone-900 dark:text-stone-100 select-all">
                  {emailAddress}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyEmail}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-mono text-xs font-bold tracking-wider uppercase hover:opacity-90 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  COPIED TO CLIPBOARD!
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

        {/* Right Column: Social Connection Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="font-mono text-xs text-stone-600 dark:text-stone-400 tracking-widest uppercase mb-2">
            STATION DISPATCH LINKS
          </div>

          <div className="space-y-3">
            {socials.map((social) => {
              const isExternal = social.href.startsWith("http");
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="group flex items-center justify-between p-4 rounded-md border border-stone-300/60 dark:border-stone-800 bg-stone-100/40 dark:bg-stone-900/40 hover:border-stone-900 dark:hover:border-stone-100 transition-all no-underline"
                >
                  <div className="flex flex-col">
                    <span className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:underline decoration-stone-400 underline-offset-4">
                      {social.label}
                    </span>
                    {social.handle && (
                      <span className="font-mono text-xs text-stone-600 dark:text-stone-400">
                        {social.handle}
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
