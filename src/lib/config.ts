// ─── Site Configuration — Single Source of Truth ─────────────────────────────
// This is the ONLY file you need to edit to update site-wide content:
// your name, nav links, social handles, project data, etc.
// ─────────────────────────────────────────────────────────────────────────────

import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  name: "Mnasie",
  role: "Systems & Low-Level Engineer",
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
      label: "Blog (Kernel Thoughts)",
      href: "https://kernel-thoughts.hashnode.dev",
      handle: "kernel-thoughts.hashnode.dev",
    },
    {
      label: "Email",
      href: "mailto:hello@mnasie.dev",
      handle: "hello@mnasie.dev",
    },
  ],

  // ── Projects ──────────────────────────────────────────────────────────────
  // Data sourced directly from repository READMEs:
  // - FlowHook: Featured C++ file-watcher CLI with build-output awareness & branching
  // - BlockStorageEngine: C++ UNIX block storage engine for single-file ForgeDB (.fdb)
  // - virtualDisk: C++ in-memory filesystem tree layer with Result<T> error handling
  // - alyson: Rust + Ratatui terminal TCP inspection & messaging TUI system
  projects: [
    {
      id: "flowhook",
      title: "FlowHook",
      description:
        "A lightweight C++ file-watcher CLI using Linux inotify with build-output awareness, contextual branching (on_success / on_failure), session logging, and true reboot persistence.",
      longDescription:
        "FlowHook is a lightweight C++17/20 file-watcher CLI built on Linux inotify. It solves the developer feedback loop by monitoring directory modifications and running build pipelines automatically. Unlike traditional watchers, FlowHook features true config persistence, contextual branching (attaching distinct commands for on_success vs. on_failure exit codes to run specialized test suites or desktop notifications), language-agnostic CLI execution, and dedicated session logging (<PROJECT>-flowhook.log).",
      tags: ["C++17/20", "Linux", "inotify", "CLI", "Build Tooling"],
      status: "featured",
      year: "2025",
      repoUrl: "https://github.com/mnasies/FlowHook",
    },
    {
      id: "block-storage-engine",
      title: "BlockStorageEngine (BSE)",
      description:
        "A UNIX-like file system implemented from scratch in C++. Simulates a block-based disk with superblock, free-block bitmap, 128-byte inode table, and data region in a single binary .fdb file.",
      longDescription:
        "BSE is the storage foundation for ForgeDB — an embeddable single-file key-value store addressed via filesystem paths (e.g. /assets/hero.png) designed to package game assets, save data, and binary files into one portable file without database servers. BSE implements the full low-level disk layout: SuperBlock (0x406EDB magic number, 4096-byte blocks, 5% reserved inode capacity), free-block Bitmap, Inode Table (128-byte inodes with 24 direct + 1 indirect block pointers), and Data Region. Disks are persisted as single .fdb binary files.",
      tags: ["C++", "Systems", "File Systems", "ForgeDB", "Low-Level"],
      status: "active",
      year: "2025",
      repoUrl: "https://github.com/mnasies/block_storage_engine",
    },
    {
      id: "virtual-disk",
      title: "virtualDisk",
      description:
        "An in-memory filesystem in C++ simulating a Unix-like directory structure with terminal interface, smart pointer tree nodes, and zero-exception Result<T> error handling.",
      longDescription:
        "VirtualDisk serves as the in-memory tree management layer for ForgeDB. Before data hits disk in BSE, VirtualDisk handles path traversal, working directories, and directory tree manipulation (mkdir, touch, cd, ls, rm) in RAM. Built around an abstract FileSystemEntity base class using std::shared_ptr and std::weak_ptr to prevent cycle references, custom Result<T> template for compiler-enforced error handling without exceptions, and an interactive shell interface for path operations.",
      tags: ["C++", "Systems", "Smart Pointers", "ForgeDB", "Data Structures"],
      status: "experimental",
      year: "2024",
      repoUrl: "https://github.com/mnasies/virtualDisk",
    },
    {
      id: "alyson",
      title: "Alyson",
      description:
        "A terminal-based multi-client TCP inspection and messaging system written in Rust with Ratatui TUI, mpsc channels, and custom length-prefixed binary framing (Bincode).",
      longDescription:
        "Alyson is a terminal-based TCP messaging & packet inspection tool written in Rust. It decouples UI rendering from asynchronous network operations using mpsc channels and features three layers: Ratatui / Crossterm TUI Application Layer, Network Engine for client/server task orchestration, and a Transport Framing Layer that encodes Bincode payloads into length-prefixed TCP binary frames (4-byte big-endian u32 header + payload). Supports room management, multi-client routing, and real-time socket inspection.",
      tags: ["Rust", "Ratatui", "TCP", "Async", "TUI", "Networking"],
      status: "experimental",
      year: "2024",
      repoUrl: "https://github.com/mnasies/alyson",
    },
  ],
};
