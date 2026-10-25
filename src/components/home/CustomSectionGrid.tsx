import type { CustomSection } from "@/types";

interface CustomSectionGridProps {
  sections?: CustomSection[];
}

export function CustomSectionGrid({ sections }: CustomSectionGridProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="dashboard-grid">
      {sections.map((section) => (
        <section
          key={section.id || section.title}
          id={section.id}
          className="dashboard-bay work-panel-content"
          aria-label={section.title}
        >
          <div className="work-section-heading">
            <div>
              <h2>{section.title}</h2>
              {section.description && (
                <p className="section-intro mt-1 text-xs text-muted-foreground">
                  {section.description}
                </p>
              )}
            </div>
            <span className="station-code">
              {section.items.length} {section.items.length === 1 ? "ENTRY" : "ENTRIES"}
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {section.items.map((item, idx) => (
              <div
                key={`${item.title}-${idx}`}
                className="project-instrument w-full text-left"
              >
                <article className="project-instrument-body">
                  <div className="flex items-center justify-between gap-2">
                    <span className="project-code">
                      {item.meta || "RECORD // LOG"}
                    </span>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary font-mono hover:text-accent flex items-center gap-1"
                        aria-label={`Open link for ${item.title}`}
                      >
                        VIEW ↗
                      </a>
                    )}
                  </div>
                  <h3 className="project-title mt-1.5">{item.title}</h3>
                  {item.description && (
                    <p className="project-summary mt-1 text-sm text-foreground/80 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </article>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
