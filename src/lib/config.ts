// ─── Site Configuration — Single Source of Truth ─────────────────────────────
// This is the ONLY file you need to edit to update site-wide content:
// your name, nav links, social handles, project data, etc.
// ─────────────────────────────────────────────────────────────────────────────

import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  name: "Mnasie",
  role: "Developer & Designer",
  issueLabel: "Vol. 01 · Est. 2026",

  // ── Primary navigation ────────────────────────────────────────────────────
  nav: [
    { label: "Work",    href: "/#projects" },
    { label: "Writing", href: "/writing" },
    { label: "Contact", href: "/#contact" },
  ],

  // ── Social / contact links ────────────────────────────────────────────────
  socials: [
    {
      label: "GitHub",
      href: "https://github.com/mnasies",
      handle: "@mnasies",
    },
    {
      label: "Email",
      href: "mailto:hello@mnasie.dev",
      handle: "hello@mnasie.dev",
    },
  ],

  // ── Projects ──────────────────────────────────────────────────────────────
  // To add a new project: add an entry here. The grid auto-updates.
  // To remove one: delete the entry. No component files need to change.
  // `featured` projects render full-width with emphasis.
  // `experimental` projects are shown with a subtle "work in progress" badge.
  projects: [
    {
      id: "flowhook",
      title: "FlowHook",
      description:
        "A lightweight C++ file-watcher CLI that defines build commands, branches on success or failure, and persists watch state across reboots.",
      longDescription:
        "FlowHook solves the developer feedback loop problem — the gap between saving a file and seeing the result. You define a watch target, a build command on success, and a fallback command on failure. FlowHook monitors the filesystem, fires the right command automatically, and remembers your configuration across reboots. Implemented in C++ with a focus on low overhead and a composable CLI design.",
      tags: ["C++", "CLI", "File Watcher", "Build Tooling"],
      status: "featured",
      year: "2025",
      repoUrl: "https://github.com/mnasies/FlowHook",
    },
    {
      id: "block-storage-engine",
      title: "BlockStorageEngine",
      description:
        "A UNIX-like file system implemented from scratch in C++, simulating a block-based disk with a superblock, bitmap, inode table, and data region in a single binary file.",
      longDescription:
        "BSE is the foundational layer I'm building toward a larger project called ForgeDB — a single-file embeddable key-value store addressed via filesystem-style paths, aimed at game devs, embedded engineers, and tool builders who need to bundle binary assets without a database server. BSE implements the full block storage layer: superblock, bitmap, inode table (128-byte inodes, 24 direct + 1 indirect block pointers), and a data region — all persisted in a `.fdb` binary file. Supports hard links, path traversal, persistent mount/unmount cycles, and dynamic disk sizing.",
      tags: ["C++", "Systems", "File Systems", "Low-Level"],
      status: "active",
      year: "2025",
      repoUrl: "https://github.com/mnasies/block_storage_engine",
    },
    {
      id: "virtual-disk",
      title: "virtualDisk",
      description:
        "An in-memory filesystem simulating a Unix-like directory structure, navigable through a built-in terminal interface.",
      longDescription:
        "virtualDisk is an earlier exploration into filesystem concepts — an in-memory virtual disk that lets you navigate a Unix-like directory tree using familiar terminal commands. It served as the conceptual precursor to BlockStorageEngine, moving from in-memory simulation toward persistent block-level storage. The project includes a built-in terminal interface for interactive exploration of the virtual directory structure.",
      tags: ["C++", "Systems", "Terminal", "Filesystem"],
      status: "experimental",
      year: "2024",
      repoUrl: "https://github.com/mnasies/virtualDisk",
    },
    {
      id: "alyson",
      title: "Alyson",
      description:
        "A terminal chat application that communicates over a raw TCP socket — no HTTP, no WebSockets, just the bare network layer.",
      longDescription:
        "Alyson is a minimal terminal chat app built to understand what happens at the network layer below HTTP. Communication happens over a raw TCP socket — you can watch packets flow in Wireshark while chatting. It's a learning project in network programming fundamentals: socket creation, binding, listening, accepting connections, and reading/writing byte streams. Simple, deliberate, educational.",
      tags: ["C++", "Networking", "TCP", "Terminal"],
      status: "experimental",
      year: "2024",
      repoUrl: "https://github.com/mnasies/alyson",
    },
  ],
};
