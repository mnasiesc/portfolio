import type { CommandHelpItem, TerminalContext, TerminalOutput } from "./types";

export const COMMAND_REGISTRY: CommandHelpItem[] = [
  {
    name: "help",
    syntax: "help",
    description: "Display all available workstation commands and their usage.",
  },
  {
    name: "about",
    syntax: "about",
    description: "Display systems developer background, role, and current status.",
  },
  {
    name: "projects",
    syntax: "projects",
    description: "List all engineering projects, status badges, and tech stacks.",
  },
  {
    name: "project",
    syntax: "project <id>",
    description: "Inspect in-depth architectural details, logs, and repository link for a project.",
  },
  {
    name: "writing",
    syntax: "writing",
    description: "List published technical essays and low-level kernel breakdowns.",
  },
  {
    name: "article",
    syntax: "article <slug>",
    description: "Open local article reader and display external Hashnode publication link.",
  },
  {
    name: "contact",
    syntax: "contact",
    description: "Show contact channels, direct email address, and collaboration terms.",
  },
  {
    name: "socials",
    syntax: "socials",
    description: "List verified developer social handles and profiles (GitHub, X, LinkedIn, etc.).",
  },
  {
    name: "clear",
    syntax: "clear",
    description: "Clear terminal buffer output.",
  },
  {
    name: "gui",
    syntax: "gui",
    description: "Exit terminal emulator and switch back to the visual portfolio GUI (or press ESC).",
  },
  {
    name: "fullscreen",
    syntax: "fullscreen",
    description: "Toggle browser fullscreen display mode (or press F11).",
  },
  {
    name: "home",
    syntax: "home",
    description: "Exit terminal emulator and switch back to the visual portfolio workstation.",
  },
];

const ALIAS_MAP: Record<string, string> = {
  "?": "help",
  h: "help",
  whoami: "about",
  bio: "about",
  info: "about",
  proj: "projects",
  work: "projects",
  articles: "writing",
  posts: "writing",
  essays: "writing",
  blog: "writing",
  email: "contact",
  mail: "contact",
  social: "socials",
  links: "socials",
  cls: "clear",
  exit: "gui",
  quit: "gui",
  home: "gui",
  f11: "fullscreen",
};

function resolveExternalArticleUrl(
  article: { slug: string; canonicalUrl?: string },
  template: string,
): string {
  if (article.canonicalUrl) return article.canonicalUrl;
  return template.replaceAll("{slug}", encodeURIComponent(article.slug));
}

export function parseCommand(rawInput: string, context: TerminalContext): TerminalOutput {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { type: "empty" };
  }

  const parts = trimmed.split(/\s+/);
  const commandRaw = parts[0];
  const commandNormalized = commandRaw.toLowerCase();
  const args = parts.slice(1);

  const command = ALIAS_MAP[commandNormalized] ?? commandNormalized;

  switch (command) {
    case "help": {
      return {
        type: "help",
        intro: context.terminal.helpIntro,
        commands: COMMAND_REGISTRY,
      };
    }

    case "about": {
      return {
        type: "about",
        name: context.site.name,
        role: context.site.role,
        bio: context.home.heroDescription,
        availability: context.home.availability,
        issueLabel: context.site.issueLabel,
      };
    }

    case "projects": {
      return {
        type: "projects",
        projects: context.projects.map((project) => ({
          id: project.id,
          title: project.title,
          status: project.status,
          tags: project.tags,
          description: project.description,
          repoUrl: project.repoUrl,
          demoUrl: project.demoUrl,
        })),
      };
    }

    case "project": {
      if (args.length === 0) {
        return {
          type: "error",
          errorType: "missing_argument",
          message: "Missing project ID. Usage: project <id>",
          suggestion: "Type 'projects' to list all valid project IDs.",
        };
      }

      const projectId = args[0].toLowerCase();
      const foundProject = context.projects.find((p) => p.id.toLowerCase() === projectId);

      if (!foundProject) {
        // Find nearest project suggestion
        const availableIds = context.projects.map((p) => p.id);
        const closeMatch = availableIds.find((id) => id.includes(projectId) || projectId.includes(id));

        return {
          type: "error",
          errorType: "not_found",
          message: `Project not found: '${args[0]}'`,
          suggestion: closeMatch
            ? `Did you mean 'project ${closeMatch}'? (Type 'projects' to list all IDs)`
            : "Type 'projects' to see all available project IDs.",
        };
      }

      return {
        type: "project",
        project: foundProject,
      };
    }

    case "writing": {
      return {
        type: "writing",
        articles: context.articles.map((article) => ({
          slug: article.slug,
          title: article.title,
          date: article.date,
          readingTime: article.readingTime,
          category: article.category,
          tags: article.tags,
          excerpt: article.excerpt,
          canonicalUrl: article.canonicalUrl,
        })),
      };
    }

    case "article": {
      if (args.length === 0) {
        return {
          type: "error",
          errorType: "missing_argument",
          message: "Missing article slug. Usage: article <slug>",
          suggestion: "Type 'writing' to list all available article slugs.",
        };
      }

      const slug = args[0].toLowerCase();
      const foundArticle = context.articles.find((a) => a.slug.toLowerCase() === slug);

      if (!foundArticle) {
        const availableSlugs = context.articles.map((a) => a.slug);
        const closeMatch = availableSlugs.find((s) => s.includes(slug) || slug.includes(s));

        return {
          type: "error",
          errorType: "not_found",
          message: `Article not found: '${args[0]}'`,
          suggestion: closeMatch
            ? `Did you mean 'article ${closeMatch}'? (Type 'writing' to list all slugs)`
            : "Type 'writing' to see all available article slugs.",
        };
      }

      return {
        type: "article",
        article: foundArticle,
        localRoute: `/writing/${foundArticle.slug}`,
        externalUrl: resolveExternalArticleUrl(foundArticle, context.writing.hashnodeLinkHref),
      };
    }

    case "contact": {
      return {
        type: "contact",
        email: context.home.contactFallbackEmail,
        availability: context.home.availability,
        description: context.home.contactDescription,
      };
    }

    case "socials": {
      return {
        type: "socials",
        socials: context.socials,
      };
    }

    case "clear": {
      return {
        type: "clear",
      };
    }

    case "gui":
    case "home": {
      return {
        type: "home",
        targetUrl: context.terminal.switchToVisualHref || "/",
        message: "Switching to visual workstation portfolio...",
      };
    }

    case "fullscreen": {
      return {
        type: "fullscreen",
        active: true,
      };
    }

    default: {
      // Find closest command suggestion
      const knownCommands = COMMAND_REGISTRY.map((c) => c.name);
      const closeMatch = knownCommands.find(
        (cmd) => cmd.startsWith(commandNormalized) || commandNormalized.startsWith(cmd),
      );

      return {
        type: "error",
        errorType: "unknown_command",
        message: `Command not recognized: '${commandRaw}'`,
        suggestion: closeMatch
          ? `Did you mean '${closeMatch}'? Type 'help' to see available commands.`
          : "Type 'help' to inspect all supported commands.",
      };
    }
  }
}
