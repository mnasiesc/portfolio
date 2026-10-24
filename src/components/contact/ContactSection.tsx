"use client";

// ─── ContactSection — Client Component ──────────────────────────────────────
// Direct contact section with one-click email copy & social links.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Copy, Check, ExternalLink, Mail } from "lucide-react";
import { SocialLink } from "@/types";

interface ContactSectionProps {
  socials: SocialLink[];
  labels: {
    contactHeading: string;
    contactDescription: string;
    contactFallbackEmail: string;
    contactEmailLabel: string;
    copyEmail: string;
    copiedEmail: string;
    linksLabel: string;
  };
}

export function ContactSection({ socials, labels }: ContactSectionProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const emailSocial = socials.find((s) => s.label.toLowerCase().includes("email"));
  const emailAddress = emailSocial?.handle || labels.contactFallbackEmail;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  return (
    <section id="contact" className="contact-panel-content">
      {/* Section Header */}
      <div className="work-section-heading contact-heading">
        <h2>
          {labels.contactHeading}
        </h2>
      </div>

      <div className="contact-grid">
        {/* Left Column: Direct Email Box */}
        <div className="lg:col-span-7 space-y-4">
          <p className="contact-description">
            {labels.contactDescription}
          </p>

          {/* Email Copy Box */}
          <div className="contact-email-panel">
            <div className="flex items-center gap-3">
              <div className="contact-icon">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="contact-label">
                  {labels.contactEmailLabel}
                </div>
                <div className="contact-email">
                  {emailAddress}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyEmail}
              type="button"
              className="station-button station-button-primary copy-button"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  {labels.copiedEmail}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {labels.copyEmail}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Social Links */}
        <div className="contact-socials">
          <div className="contact-label">
            {labels.linksLabel}
          </div>

          <div className="contact-link-list">
            {socials.map((social) => {
              const isExternal = social.href.startsWith("http");
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="contact-link group"
                >
                  <div className="flex items-center gap-3">
                    <span className="contact-link-name">
                      {social.label}
                    </span>
                    {social.handle && (
                      <span className="contact-link-handle">
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
