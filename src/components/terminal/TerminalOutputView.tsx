import Link from "next/link";
import type { TerminalOutput } from "@/lib/terminal/types";

interface TerminalOutputViewProps {
  output: TerminalOutput;
  onExecuteCommand?: (command: string) => void;
}

export function TerminalOutputView({ output, onExecuteCommand }: TerminalOutputViewProps) {
  switch (output.type) {
    case "empty":
      return null;

    case "help":
      return (
        <div className="terminal-output-block space-y-3">
          <p className="text-stone-300 dark:text-stone-300 font-mono text-sm leading-relaxed">
            {output.intro}
          </p>
          <div className="grid grid-cols-1 gap-2 pt-1 font-mono text-xs sm:text-sm">
            {output.commands.map((cmd) => (
              <div
                key={cmd.name}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1 border-b border-stone-800/40 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => onExecuteCommand?.(cmd.syntax)}
                  className="font-bold text-emerald-400 hover:text-emerald-300 dark:text-[#8dff55] dark:hover:text-[#aaff77] text-left underline sm:no-underline hover:underline cursor-pointer min-w-[140px]"
                >
                  {cmd.syntax}
                </button>
                <span className="text-stone-400 dark:text-stone-400 text-xs sm:text-sm">
                  {cmd.description}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-500 font-mono pt-2">
            Tip: Click any command above or use Up/Down arrow keys for command history.
          </p>
        </div>
      );

    case "about":
      return (
        <div className="terminal-output-block space-y-3 font-mono text-sm">
          <div className="border-l-2 border-emerald-500 dark:border-[#8dff55] pl-3 py-1 space-y-1">
            <div className="text-base sm:text-lg font-bold text-stone-100">
              {output.name}
            </div>
            <div className="text-emerald-400 dark:text-[#8dff55] text-xs uppercase tracking-wider">
              {output.role} — {output.issueLabel}
            </div>
          </div>
          <p className="text-stone-300 leading-relaxed text-xs sm:text-sm">
            {output.bio}
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-stone-400">AVAILABILITY:</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 dark:text-[#8dff55] border border-emerald-800/60 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-[#8dff55] animate-pulse" />
              {output.availability}
            </span>
          </div>
        </div>
      );

    case "projects":
      return (
        <div className="terminal-output-block space-y-4 font-mono text-xs sm:text-sm">
          <div className="text-stone-400 text-xs uppercase tracking-wider pb-1 border-b border-stone-800">
            REGISTERED PROJECTS ({output.projects.length})
          </div>
          <div className="space-y-4">
            {output.projects.map((proj) => (
              <div
                key={proj.id}
                className="p-3 rounded bg-stone-900/60 border border-stone-800 space-y-2 hover:border-stone-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onExecuteCommand?.(`project ${proj.id}`)}
                      className="font-bold text-stone-100 hover:text-emerald-300 dark:hover:text-[#8dff55] underline cursor-pointer text-sm"
                    >
                      {proj.title}
                    </button>
                    <span className="text-xs text-stone-500">[{proj.id}]</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-stone-800 text-stone-300 border border-stone-700">
                    {proj.status}
                  </span>
                </div>
                <p className="text-stone-400 text-xs leading-relaxed">
                  {proj.description}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {proj.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 text-[10px] rounded bg-stone-800/80 text-stone-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onExecuteCommand?.(`project ${proj.id}`)}
                      className="text-emerald-400 dark:text-[#8dff55] hover:underline cursor-pointer text-xs"
                    >
                      inspect →
                    </button>
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-stone-200 underline text-xs"
                    >
                      repo ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-500 pt-1">
            Type <span className="text-emerald-400 dark:text-[#8dff55]">project &lt;id&gt;</span> (e.g. <button type="button" onClick={() => onExecuteCommand?.("project flowhook")} className="underline cursor-pointer">project flowhook</button>) to view full architecture details and logs.
          </p>
        </div>
      );

    case "project":
      return (
        <div className="terminal-output-block space-y-4 font-mono text-xs sm:text-sm">
          <div className="border-l-2 border-emerald-500 dark:border-[#8dff55] pl-3 py-1 space-y-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold text-stone-100">
                {output.project.title}
              </span>
              <span className="text-xs text-stone-500">[{output.project.id}]</span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-stone-800 text-stone-300 border border-stone-700 ml-auto">
                {output.project.status} · {output.project.year}
              </span>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {output.project.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {output.project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded bg-stone-800/90 text-stone-300 border border-stone-700/60"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="p-3.5 rounded bg-stone-900/80 border border-stone-800 space-y-2 text-stone-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-mono">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest border-b border-stone-800 pb-1">
              ARCHITECTURAL BRIEF // SYSTEM SPEC
            </div>
            <div>{output.project.longDescription}</div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <a
              href={output.project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 text-xs font-semibold no-underline"
            >
              <span>GitHub Repository</span>
              <span>↗</span>
            </a>
            {output.project.demoUrl && (
              <a
                href={output.project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 dark:text-[#8dff55] border border-emerald-800 text-xs font-semibold no-underline"
              >
                <span>Live Demonstration</span>
                <span>↗</span>
              </a>
            )}
          </div>
        </div>
      );

    case "writing":
      return (
        <div className="terminal-output-block space-y-4 font-mono text-xs sm:text-sm">
          <div className="text-stone-400 text-xs uppercase tracking-wider pb-1 border-b border-stone-800">
            TECHNICAL ESSAYS & KERNEL NOTES ({output.articles.length})
          </div>
          <div className="space-y-3">
            {output.articles.map((article) => (
              <div
                key={article.slug}
                className="p-3 rounded bg-stone-900/60 border border-stone-800 space-y-1.5 hover:border-stone-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onExecuteCommand?.(`article ${article.slug}`)}
                    className="font-bold text-stone-100 hover:text-emerald-300 dark:hover:text-[#8dff55] underline cursor-pointer text-left text-sm"
                  >
                    {article.title}
                  </button>
                  <span className="text-xs text-stone-500 whitespace-nowrap">
                    {article.date} · {article.readingTime}
                  </span>
                </div>
                <p className="text-stone-400 text-xs leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold">
                    [{article.category}]
                  </span>
                  <button
                    type="button"
                    onClick={() => onExecuteCommand?.(`article ${article.slug}`)}
                    className="text-emerald-400 dark:text-[#8dff55] hover:underline cursor-pointer"
                  >
                    read article (article {article.slug}) →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-500 pt-1">
            Type <span className="text-emerald-400 dark:text-[#8dff55]">article &lt;slug&gt;</span> to open the article reader and view its Hashnode destination.
          </p>
        </div>
      );

    case "article":
      return (
        <div className="terminal-output-block space-y-4 font-mono text-xs sm:text-sm">
          <div className="border-l-2 border-emerald-500 dark:border-[#8dff55] pl-3 py-1 space-y-1">
            <span className="text-xs text-stone-500 uppercase">
              {output.article.category} · {output.article.date} · {output.article.readingTime}
            </span>
            <div className="text-base sm:text-lg font-bold text-stone-100">
              {output.article.title}
            </div>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed italic">
              {output.article.excerpt}
            </p>
          </div>

          <div className="p-3 rounded bg-emerald-950/30 border border-emerald-900/50 space-y-3">
            <div className="text-xs text-emerald-400 dark:text-[#8dff55] font-semibold uppercase tracking-wider">
              ARTICLE ROUTE & EXTERNAL DESTINATION
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link
                href={output.localRoute}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs no-underline transition-colors"
              >
                <span>OPEN LOCAL ARTICLE READER</span>
                <span>→</span>
              </Link>
              {output.externalUrl && (
                <a
                  href={output.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs no-underline transition-colors"
                >
                  <span>View Original on Hashnode</span>
                  <span>↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      );

    case "contact":
      return (
        <div className="terminal-output-block space-y-3 font-mono text-xs sm:text-sm">
          <div className="text-stone-400 text-xs uppercase tracking-wider pb-1 border-b border-stone-800">
            CONTACT & COLLABORATION
          </div>
          <p className="text-stone-300 leading-relaxed text-xs sm:text-sm">
            {output.description}
          </p>
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-stone-400 min-w-[80px]">EMAIL:</span>
              <a
                href={`mailto:${output.email}`}
                className="font-bold text-emerald-400 hover:text-emerald-300 dark:text-[#8dff55] dark:hover:text-[#aaff77] underline cursor-pointer"
              >
                {output.email}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-stone-400 min-w-[80px]">STATUS:</span>
              <span className="text-stone-200 font-semibold">{output.availability}</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 pt-2">
            Run &apos;socials&lt; to inspect verified GitHub, X, LinkedIn, and Telegram channels.
          </p>
        </div>
      );

    case "socials":
      return (
        <div className="terminal-output-block space-y-3 font-mono text-xs sm:text-sm">
          <div className="text-stone-400 text-xs uppercase tracking-wider pb-1 border-b border-stone-800">
            VERIFIED SOCIAL CHANNELS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {output.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded bg-stone-900/60 border border-stone-800 hover:border-stone-700 text-stone-200 hover:text-emerald-300 dark:hover:text-[#8dff55] no-underline transition-colors"
              >
                <span className="font-bold">{social.label}</span>
                <span className="text-stone-400 text-xs">{social.handle || "view ↗"}</span>
              </a>
            ))}
          </div>
        </div>
      );

    case "clear":
      return null;

    case "fullscreen":
      return (
        <div className="terminal-output-block font-mono text-xs sm:text-sm text-emerald-400 dark:text-[#8dff55]">
          Fullscreen mode toggled. (Press F11 or type &apos;fullscreen&apos; again to toggle, or press ESC / type &apos;gui&apos; to exit to visual mode).
        </div>
      );

    case "home":
      return (
        <div className="terminal-output-block space-y-2 font-mono text-xs sm:text-sm text-emerald-400 dark:text-[#8dff55]">
          <p>{output.message}</p>
          <Link href={output.targetUrl} className="underline text-stone-200 text-xs">
            Click here if you are not automatically redirected to {output.targetUrl} →
          </Link>
        </div>
      );

    case "error":
      return (
        <div className="terminal-output-block space-y-1 font-mono text-xs sm:text-sm">
          <div className="text-red-400 dark:text-red-300 font-semibold flex items-center gap-2">
            <span>[ERROR]</span>
            <span>{output.message}</span>
          </div>
          {output.suggestion && (
            <p className="text-stone-400 text-xs pl-4 border-l border-red-500/40">
              {output.suggestion}
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
}
