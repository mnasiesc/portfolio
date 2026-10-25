// ─── Home Page — React Server Component ──────────────────────────────────────
// No "use client" — this runs on the server and outputs static HTML.
// Interactive pieces (ProjectsSection modal) are Client Components imported
// inside it. Next.js handles the boundary automatically.
//
// The page loads validated content and passes the fields each section needs.
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";
import { getAllArticles, getImage, portfolio, projects, socials } from "@/lib/portfolio";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { WritingsSection } from "@/components/writing/WritingsSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { CustomSectionGrid } from "@/components/home/CustomSectionGrid";
import { getAvailabilityClass } from "@/lib/status";

export default async function HomePage() {
  const articles = getAllArticles();
  const availClass = getAvailabilityClass(portfolio.home.availability);

  return (
    <div className="station-page">
      <div className="station-shell">
        <section className="profile-console" aria-labelledby="profile-title">
          <div className="console-rail">
            <span>PROFILE.SYS</span>
            <span>USER: {portfolio.site.name.toUpperCase()}</span>
          </div>
          <div className="profile-console-body">
            <div className="profile-portrait">
              <Image
                src={getImage(portfolio.home.avatarImage).generatedFile}
                alt={getImage(portfolio.home.avatarImage).alt}
                width={getImage(portfolio.home.avatarImage).width}
                height={getImage(portfolio.home.avatarImage).height}
                sizes="(max-width: 640px) 112px, 144px"
                preload
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="profile-copy">
              <p className="profile-kicker">{portfolio.site.role}</p>
              <h1 id="profile-title">{portfolio.home.heroTitle}</h1>
              <p className="profile-description">{portfolio.home.heroDescription}</p>
              <div className="profile-actions">
                {portfolio.home.actions.map((action, index) => (
                  <a
                    key={action.href}
                    href={action.href}
                    className={index === 0 ? "station-button station-button-primary" : "station-button"}
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            </div>
            <aside className={`profile-readout ${availClass}`} aria-label={portfolio.home.availability}>
              <span className="readout-label">STATUS</span>
              <span className={`readout-indicator ${availClass}`} aria-hidden="true" />
              <span className={`readout-value ${availClass}`}>{portfolio.home.availability}</span>
            </aside>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-bay project-bay" aria-label={portfolio.home.projectHeading}>
            <ProjectsSection
              projects={projects}
              images={portfolio.images.map(({ id, mimeType, generatedFile, width, height, alt }) => ({
                id,
                mimeType,
                generatedFile,
                width,
                height,
                alt,
              }))}
              labels={{ ...portfolio.home, ...portfolio.writing }}
            />
          </section>
          <section className="dashboard-bay writing-bay" aria-label={portfolio.home.writingHeading}>
            <WritingsSection articles={articles} labels={{ ...portfolio.home, ...portfolio.writing }} />
          </section>
        </div>

        {portfolio.home.customSections && portfolio.home.customSections.length > 0 && (
          <CustomSectionGrid sections={portfolio.home.customSections} />
        )}

        <section className="dashboard-bay contact-bay" aria-label={portfolio.home.contactHeading}>
          <ContactSection socials={socials} labels={portfolio.home} />
        </section>
        <footer className="station-footer">
          <span>{portfolio.site.name}</span>
          <span>{portfolio.site.issueLabel}</span>
          <span>LOCAL SYSTEM / PUBLIC PORTFOLIO</span>
        </footer>
      </div>
    </div>
  );
}
