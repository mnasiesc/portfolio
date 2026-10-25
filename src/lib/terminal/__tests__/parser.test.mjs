import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseCommand, COMMAND_REGISTRY } from "../parser.ts";

const mockContext = {
  site: {
    name: "Mnasie",
    role: "Systems & Low-Level Engineer",
    issueLabel: "Vol. 01 · Est. 2026",
  },
  home: {
    heroTitle: "Systems Programmer",
    heroDescription: "Interested in the kernel, backend systems, and low-level tooling.",
    availability: "Open to Opportunities",
    contactDescription: "Open to engineering roles and technical collaboration.",
    contactFallbackEmail: "manassehsamuel642@gmail.com",
  },
  projects: [
    {
      id: "flowhook",
      title: "FlowHook",
      description: "A lightweight C++17/20 file watcher CLI.",
      longDescription: "Detailed FlowHook architecture writeup.",
      tags: ["C++", "Linux", "inotify"],
      status: "featured",
      year: "2026",
      repoUrl: "https://github.com/mnasies/FlowHook",
      demoUrl: "https://demo.example.com/flowhook",
    },
    {
      id: "block-storage-engine",
      title: "Block Storage Engine",
      description: "Custom WAL-backed block storage engine.",
      longDescription: "Storage engine internals.",
      tags: ["Rust", "Storage", "WAL"],
      status: "active",
      year: "2025",
      repoUrl: "https://github.com/mnasies/block-storage",
    },
  ],
  articles: [
    {
      slug: "building-a-recursive-filewatcher",
      title: "Building a Recursive Filewatcher",
      date: "2025-02-15",
      readingTime: "5 min read",
      category: "Systems & C++",
      tags: ["C++", "Linux"],
      excerpt: "How I engineered FlowHook in C++.",
      canonicalUrl: "https://kernel-thoughts.hashnode.dev/building-a-recursive-filewatcher",
    },
    {
      slug: "how-does-your-cpu-know-mouse-click",
      title: "How does your CPU know when you click your mouse?",
      date: "2025-01-20",
      readingTime: "4 min read",
      category: "Hardware & OS",
      tags: ["CPU", "Kernel"],
      excerpt: "Deep dive into hardware interrupts.",
    },
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/mnasies", handle: "@mnasies" },
    { label: "X", href: "https://x.com/mnasies", handle: "@mnasies" },
  ],
  writing: {
    hashnodeLinkHref: "https://kernel-thoughts.hashnode.dev/{slug}",
  },
  terminal: {
    pageTitle: "Terminal Workstation | Mnasie",
    pageDescription: "Command simulator",
    promptUser: "guest",
    promptHost: "station",
    welcomeBanner: ["WELCOME TO STATION"],
    helpIntro: "Available commands in this portfolio simulator:",
    switchToVisualLabel: "VISUAL MODE",
    switchToVisualHref: "/",
    navLabel: "Terminal",
  },
};

describe("Terminal Command Parser - Strict 11 Commands", () => {
  it("handles empty and whitespace input", () => {
    assert.deepEqual(parseCommand("", mockContext), { type: "empty" });
    assert.deepEqual(parseCommand("   ", mockContext), { type: "empty" });
  });

  it("handles 'help' command and registry with exactly 11 commands", () => {
    const result = parseCommand("help", mockContext);
    assert.equal(result.type, "help");
    assert.equal(result.commands.length, 11);
    assert.deepEqual(result.commands, COMMAND_REGISTRY);

    const commandNames = result.commands.map((c) => c.name);
    assert.deepEqual(commandNames, [
      "help",
      "whoami",
      "projects",
      "project",
      "writings",
      "writing",
      "contact",
      "socials",
      "clear",
      "gui",
      "fullscreen",
    ]);

    // Help aliases
    assert.equal(parseCommand("?", mockContext).type, "help");
    assert.equal(parseCommand("h", mockContext).type, "help");
  });

  it("handles 'whoami' command (not about)", () => {
    const result = parseCommand("whoami", mockContext);
    assert.equal(result.type, "whoami");
    assert.equal(result.name, "Mnasie");
    assert.equal(result.role, "Systems & Low-Level Engineer");
    assert.equal(result.bio, "Interested in the kernel, backend systems, and low-level tooling.");
    assert.equal(result.availability, "Open to Opportunities");
    assert.equal(result.issueLabel, "Vol. 01 · Est. 2026");
  });

  it("handles 'projects' command with 1-based number IDs", () => {
    const result = parseCommand("projects", mockContext);
    assert.equal(result.type, "projects");
    assert.equal(result.projects.length, 2);
    assert.equal(result.projects[0].numberId, 1);
    assert.equal(result.projects[0].id, "flowhook");
    assert.equal(result.projects[0].title, "FlowHook");
    assert.equal(result.projects[1].numberId, 2);
    assert.equal(result.projects[1].id, "block-storage-engine");

    // Case insensitivity
    assert.equal(parseCommand("PROJECTS", mockContext).type, "projects");
  });

  it("handles 'project <id/name>' with number id and slug", () => {
    // Lookup by number ID 1
    const byNum = parseCommand("project 1", mockContext);
    assert.equal(byNum.type, "project");
    assert.equal(byNum.numberId, 1);
    assert.equal(byNum.project.id, "flowhook");
    assert.equal(byNum.project.title, "FlowHook");

    // Lookup by string ID/name
    const byId = parseCommand("project flowhook", mockContext);
    assert.equal(byId.type, "project");
    assert.equal(byId.numberId, 1);
    assert.equal(byId.project.id, "flowhook");

    // Lookup by second project number ID 2
    const byNum2 = parseCommand("project 2", mockContext);
    assert.equal(byNum2.type, "project");
    assert.equal(byNum2.numberId, 2);
    assert.equal(byNum2.project.id, "block-storage-engine");
  });

  it("handles 'project' with missing argument", () => {
    const result = parseCommand("project", mockContext);
    assert.equal(result.type, "error");
    assert.equal(result.errorType, "missing_argument");
    assert.match(result.message, /Missing project ID or name/i);
    assert.match(result.suggestion, /number IDs/i);
  });

  it("handles 'project <id>' with non-existent id and provides suggestion", () => {
    const result = parseCommand("project 99", mockContext);
    assert.equal(result.type, "error");
    assert.equal(result.errorType, "not_found");
    assert.match(result.message, /Project not found: '99'/i);

    const byNameNotFound = parseCommand("project nonexistent", mockContext);
    assert.equal(byNameNotFound.type, "error");
    assert.equal(byNameNotFound.errorType, "not_found");
  });

  it("handles 'writings' command with 1-based number IDs", () => {
    const result = parseCommand("writings", mockContext);
    assert.equal(result.type, "writings");
    assert.equal(result.articles.length, 2);
    assert.equal(result.articles[0].numberId, 1);
    assert.equal(result.articles[0].slug, "building-a-recursive-filewatcher");
    assert.equal(result.articles[1].numberId, 2);
    assert.equal(result.articles[1].slug, "how-does-your-cpu-know-mouse-click");
  });

  it("handles 'writing <id>' by number ID and slug", () => {
    // By number ID 1
    const byNum = parseCommand("writing 1", mockContext);
    assert.equal(byNum.type, "writing");
    assert.equal(byNum.article.numberId, 1);
    assert.equal(byNum.article.slug, "building-a-recursive-filewatcher");
    assert.equal(byNum.localRoute, "/writing/building-a-recursive-filewatcher");
    assert.equal(byNum.externalUrl, "https://kernel-thoughts.hashnode.dev/building-a-recursive-filewatcher");

    // By slug
    const bySlug = parseCommand("writing how-does-your-cpu-know-mouse-click", mockContext);
    assert.equal(bySlug.type, "writing");
    assert.equal(bySlug.article.numberId, 2);
    assert.equal(bySlug.article.slug, "how-does-your-cpu-know-mouse-click");
    assert.equal(bySlug.localRoute, "/writing/how-does-your-cpu-know-mouse-click");
    assert.equal(bySlug.externalUrl, "https://kernel-thoughts.hashnode.dev/how-does-your-cpu-know-mouse-click");
  });

  it("handles 'writing' missing argument or not found", () => {
    const missing = parseCommand("writing", mockContext);
    assert.equal(missing.type, "error");
    assert.equal(missing.errorType, "missing_argument");

    const notFound = parseCommand("writing 99", mockContext);
    assert.equal(notFound.type, "error");
    assert.equal(notFound.errorType, "not_found");
  });

  it("handles 'contact' command", () => {
    const result = parseCommand("contact", mockContext);
    assert.equal(result.type, "contact");
    assert.equal(result.email, "manassehsamuel642@gmail.com");
    assert.equal(result.availability, "Open to Opportunities");
  });

  it("handles 'socials' command", () => {
    const result = parseCommand("socials", mockContext);
    assert.equal(result.type, "socials");
    assert.equal(result.socials.length, 2);
    assert.equal(result.socials[0].label, "GitHub");
  });

  it("handles 'clear' command", () => {
    const result = parseCommand("clear", mockContext);
    assert.equal(result.type, "clear");

    assert.equal(parseCommand("cls", mockContext).type, "clear");
  });

  it("handles 'gui' command", () => {
    const result = parseCommand("gui", mockContext);
    assert.equal(result.type, "gui");
    assert.equal(result.targetUrl, "/");

    // gui aliases
    assert.equal(parseCommand("exit", mockContext).type, "gui");
    assert.equal(parseCommand("quit", mockContext).type, "gui");
  });

  it("handles 'fullscreen' command", () => {
    const result = parseCommand("fullscreen", mockContext);
    assert.equal(result.type, "fullscreen");
    assert.equal(result.active, true);

    assert.equal(parseCommand("f11", mockContext).type, "fullscreen");
  });

  it("handles unknown commands and provides closest suggestion", () => {
    const result = parseCommand("projec", mockContext);
    assert.equal(result.type, "error");
    assert.equal(result.errorType, "unknown_command");
    assert.match(result.suggestion, /project/i);

    const totallyUnknown = parseCommand("foobar123", mockContext);
    assert.equal(totallyUnknown.type, "error");
    assert.equal(totallyUnknown.errorType, "unknown_command");
    assert.match(totallyUnknown.suggestion, /help/i);
  });
});
