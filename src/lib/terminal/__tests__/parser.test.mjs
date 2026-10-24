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

describe("Terminal Command Parser", () => {
  it("handles empty and whitespace input", () => {
    assert.deepEqual(parseCommand("", mockContext), { type: "empty" });
    assert.deepEqual(parseCommand("   ", mockContext), { type: "empty" });
  });

  it("handles 'help' command and registry", () => {
    const result = parseCommand("help", mockContext);
    assert.equal(result.type, "help");
    assert.equal(result.commands.length, 10);
    assert.deepEqual(result.commands, COMMAND_REGISTRY);

    // Aliases
    assert.equal(parseCommand("?", mockContext).type, "help");
    assert.equal(parseCommand("h", mockContext).type, "help");
  });

  it("handles 'about' command", () => {
    const result = parseCommand("about", mockContext);
    assert.equal(result.type, "about");
    assert.equal(result.name, "Mnasie");
    assert.equal(result.role, "Systems & Low-Level Engineer");
    assert.equal(result.availability, "Open to Opportunities");

    // Alias
    assert.equal(parseCommand("whoami", mockContext).type, "about");
  });

  it("handles 'projects' command", () => {
    const result = parseCommand("projects", mockContext);
    assert.equal(result.type, "projects");
    assert.equal(result.projects.length, 2);
    assert.equal(result.projects[0].id, "flowhook");
    assert.equal(result.projects[0].title, "FlowHook");

    // Case insensitivity
    assert.equal(parseCommand("PROJECTS", mockContext).type, "projects");
  });

  it("handles 'project <id>' with valid id", () => {
    const result = parseCommand("project flowhook", mockContext);
    assert.equal(result.type, "project");
    assert.equal(result.project.id, "flowhook");
    assert.equal(result.project.title, "FlowHook");
    assert.equal(result.project.longDescription, "Detailed FlowHook architecture writeup.");
    assert.equal(result.project.demoUrl, "https://demo.example.com/flowhook");
  });

  it("handles 'project' with missing argument", () => {
    const result = parseCommand("project", mockContext);
    assert.equal(result.type, "error");
    assert.equal(result.errorType, "missing_argument");
    assert.match(result.message, /Missing project ID/i);
    assert.match(result.suggestion, /Type 'projects'/i);
  });

  it("handles 'project <id>' with non-existent id and provides suggestion", () => {
    const result = parseCommand("project flow", mockContext);
    assert.equal(result.type, "error");
    assert.equal(result.errorType, "not_found");
    assert.match(result.message, /Project not found: 'flow'/i);
    assert.match(result.suggestion, /flowhook/i);
  });

  it("handles 'writing' command", () => {
    const result = parseCommand("writing", mockContext);
    assert.equal(result.type, "writing");
    assert.equal(result.articles.length, 2);
    assert.equal(result.articles[0].slug, "building-a-recursive-filewatcher");
  });

  it("handles 'article <slug>' with canonical URL", () => {
    const result = parseCommand("article building-a-recursive-filewatcher", mockContext);
    assert.equal(result.type, "article");
    assert.equal(result.article.slug, "building-a-recursive-filewatcher");
    assert.equal(result.localRoute, "/writing/building-a-recursive-filewatcher");
    assert.equal(result.externalUrl, "https://kernel-thoughts.hashnode.dev/building-a-recursive-filewatcher");
  });

  it("handles 'article <slug>' falling back to template URL", () => {
    const result = parseCommand("article how-does-your-cpu-know-mouse-click", mockContext);
    assert.equal(result.type, "article");
    assert.equal(result.article.slug, "how-does-your-cpu-know-mouse-click");
    assert.equal(result.localRoute, "/writing/how-does-your-cpu-know-mouse-click");
    assert.equal(result.externalUrl, "https://kernel-thoughts.hashnode.dev/how-does-your-cpu-know-mouse-click");
  });

  it("handles 'article' missing slug and non-existent slug", () => {
    const missing = parseCommand("article", mockContext);
    assert.equal(missing.type, "error");
    assert.equal(missing.errorType, "missing_argument");

    const notFound = parseCommand("article cpu", mockContext);
    assert.equal(notFound.type, "error");
    assert.equal(notFound.errorType, "not_found");
    assert.match(notFound.suggestion, /how-does-your-cpu-know-mouse-click/i);
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

  it("handles 'home' command", () => {
    const result = parseCommand("home", mockContext);
    assert.equal(result.type, "home");
    assert.equal(result.targetUrl, "/");

    assert.equal(parseCommand("exit", mockContext).type, "home");
    assert.equal(parseCommand("gui", mockContext).type, "home");
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
