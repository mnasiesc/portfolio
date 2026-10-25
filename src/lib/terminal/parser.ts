import type { CommandHelpItem, TerminalContext, TerminalOutput } from "./types";

export const COMMAND_REGISTRY: CommandHelpItem[] = [
  {
    name: "help",
    syntax: "help",
    description: "Display all available workstation commands and their usage.",
  },
  {
    name: "whoami",
    syntax: "whoami",
    description: "Display developer background, role, and availability status.",
  },
  {
    name: "projects",
    syntax: "projects",
    description: "List all engineering projects with their number IDs.",
  },
  {
    name: "project",
    syntax: "project <id/name>",
    description: "Inspect architectural details and repository links by project number ID or name.",
  },
  {
    name: "writings",
    syntax: "writings",
    description: "List all published technical essays with their number IDs.",
  },
  {
    name: "writing",
    syntax: "writing <id>",
    description: "Open article reader and view Hashnode destination by writing number ID or slug.",
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
    description: "Exit terminal emulator and switch back to the visual GUI portfolio (or press ESC).",
  },
  {
    name: "fullscreen",
    syntax: "fullscreen",
    description: "Toggle browser fullscreen display mode (or press F11).",
  },
];

const ALIAS_MAP: Record<string, string> = {
  "?": "help",
  h: "help",
  cls: "clear",
  f11: "fullscreen",
  exit: "gui",
  quit: "gui",
  home: "gui",
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

    case "whoami": {
      return {
        type: "whoami",
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
        projects: context.projects.map((project, index) => ({
          numberId: index + 1,
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
          message: "Missing project ID or name. Usage: project <id/name>",
          suggestion: "Type 'projects' to list all valid projects with their number IDs.",
        };
      }

      const query = args[0].trim().toLowerCase();
      const num = parseInt(query, 10);
      let foundProject = undefined;
      let projectNumber = -1;

      if (!isNaN(num) && num >= 1 && num <= context.projects.length) {
        foundProject = context.projects[num - 1];
        projectNumber = num;
      } else {
        const foundIndex = context.projects.findIndex(
          (p) => p.id.toLowerCase() === query || p.title.toLowerCase() === query,
        );
        if (foundIndex !== -1) {
          foundProject = context.projects[foundIndex];
          projectNumber = foundIndex + 1;
        }
      }

      if (!foundProject) {
        return {
          type: "error",
          errorType: "not_found",
          message: `Project not found: '${args[0]}'`,
          suggestion: "Type 'projects' to see all available project number IDs and names.",
        };
      }

      return {
        type: "project",
        project: foundProject,
        numberId: projectNumber,
      };
    }

    case "writings": {
      return {
        type: "writings",
        articles: context.articles.map((article, index) => ({
          numberId: index + 1,
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

    case "writing": {
      if (args.length === 0) {
        return {
          type: "error",
          errorType: "missing_argument",
          message: "Missing writing ID or slug. Usage: writing <id>",
          suggestion: "Type 'writings' to list all available essays with their number IDs.",
        };
      }

      const query = args[0].trim().toLowerCase();
      const num = parseInt(query, 10);
      let foundArticle = undefined;
      let articleNumber = -1;

      if (!isNaN(num) && num >= 1 && num <= context.articles.length) {
        foundArticle = context.articles[num - 1];
        articleNumber = num;
      } else {
        const foundIndex = context.articles.findIndex(
          (a) => a.slug.toLowerCase() === query || a.title.toLowerCase() === query,
        );
        if (foundIndex !== -1) {
          foundArticle = context.articles[foundIndex];
          articleNumber = foundIndex + 1;
        }
      }

      if (!foundArticle) {
        return {
          type: "error",
          errorType: "not_found",
          message: `Writing not found: '${args[0]}'`,
          suggestion: "Type 'writings' to see all available writing number IDs and slugs.",
        };
      }

      return {
        type: "writing",
        article: {
          numberId: articleNumber,
          slug: foundArticle.slug,
          title: foundArticle.title,
          date: foundArticle.date,
          readingTime: foundArticle.readingTime,
          category: foundArticle.category,
          tags: foundArticle.tags,
          excerpt: foundArticle.excerpt,
          canonicalUrl: foundArticle.canonicalUrl,
        },
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

    case "gui": {
      return {
        type: "gui",
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
