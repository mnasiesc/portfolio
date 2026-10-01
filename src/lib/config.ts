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
      label: "X",
      href: "https://x.com/mnasies",
      handle: "@mnasies",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/manasseh-samuel-848682324",
      handle: "manasseh-samuel",
    },
    {
      label: "Email",
      href: "mailto:manassehsamuel642@gmail.com",
      handle: "manassehsamuel642@gmail.com",
    },
    {
      label: "Telegram",
      href: "https://t.me/mnasies",
      handle: "@mnasies",
    },
    {
      label: "GitHub",
      href: "https://github.com/mnasies",
      handle: "@mnasies",
    },
    {
      label: "Blog",
      href: "https://kernel-thoughts.hashnode.dev",
      handle: "kernel-thoughts.hashnode.dev",
    },
  ],

  // ── Projects ──────────────────────────────────────────────────────────────
  projects: [
    {
      id: "flowhook",
      title: "FlowHook",
      description:
        "A lightweight C++17/20 file watcher CLI built on Linux inotify. Features automated build execution, exit-code branching (on_success and on_failure), session logging, and reboot persistence.",
      longDescription:
        "FlowHook is a lightweight file watcher CLI written in C++17/20 that automates the developer build cycle using native Linux `inotify`.\n\nInstead of polling or relying on heavy runtime interpreters, it hooks directly into kernel filesystem events (`IN_MODIFY`, `IN_CREATE`, `IN_DELETE`) with an in-memory debounce window to eliminate duplicate event spikes.\n\nKey architectural features:\n- Contextual Branching: Triggers distinct command pipelines based on build exit status, using `on_success` for tests and `on_failure` for desktop alerts.\n- Config Persistence: Configurations are written to a durable project file, allowing `flowhook run` to restore execution state across system reboots.\n- Session Logging: Automatically appends build timestamps and terminal output to `<PROJECT>-flowhook.log` in the project root.\n- Language Agnostic: Works seamlessly across C++, Rust, Go, Python, and TypeScript projects.",
      tags: ["C++17/20", "Linux", "inotify", "CLI", "Build Tooling"],
      status: "featured",
      year: "2025",
      repoUrl: "https://github.com/mnasies/FlowHook",
    },
    {
      id: "block-storage-engine",
      title: "BlockStorageEngine (BSE)",
      description:
        "A UNIX-like block filesystem implemented from scratch in C++. Manages custom binary disks with a superblock, free-block bitmap, 128-byte inode tables, and data blocks.",
      longDescription:
        "BlockStorageEngine (BSE) is a custom low-level storage engine written in C++ that simulates a UNIX block-based filesystem inside a single portable `.fdb` binary file.\n\nIt serves as the underlying persistence layer for ForgeDB, packaging game assets, application state, and binary blobs into structured disk blocks without third-party databases.\n\nDisk layout implementation:\n- `SuperBlock`: Stored at offset zero with magic number `0x406EDB`, 4096-byte block sizing, and 5% reserved inode capacity.\n- Free-Block `Bitmap`: Tracks allocated and free blocks at bit-level granularity.\n- `Inode Table`: Fixed 128-byte inodes containing file metadata, 24 direct block pointers, and 1 indirect block pointer.\n- `Data Region`: Raw 4096-byte disk blocks allocated on demand for file content.",
      tags: ["C++", "Systems", "File Systems", "ForgeDB", "Low-Level"],
      status: "active",
      year: "2025",
      repoUrl: "https://github.com/mnasies/block_storage_engine",
    },
    {
      id: "virtual-disk",
      title: "virtualDisk",
      description:
        "An in-memory filesystem in C++ featuring hierarchical directory traversal, smart pointer tree nodes, and zero-exception Result<T> error handling.",
      longDescription:
        "virtualDisk is an in-memory filesystem tree layer written in C++ that manages directories and files in RAM before persisting them to disk.\n\nIt acts as the working tree manager for ForgeDB, providing fast path traversal, directory navigation, and file manipulation.\n\nCore design details:\n- Cycle-Free Node Hierarchy: Implements `std::shared_ptr` for downward ownership and `std::weak_ptr` for parent references to eliminate circular memory leaks.\n- Zero-Exception Architecture: Uses a custom `Result<T>` template inspired by Rust to enforce compile-time error handling without runtime exception overhead.\n- Interactive Terminal Shell: Provides shell operations including `mkdir`, `touch`, `cd`, `ls`, and `rm` with realistic error codes.",
      tags: ["C++", "Systems", "Smart Pointers", "ForgeDB", "Data Structures"],
      status: "experimental",
      year: "2024",
      repoUrl: "https://github.com/mnasies/virtualDisk",
    },
    {
      id: "alyson",
      title: "Alyson",
      description:
        "A terminal TCP packet inspection and messaging tool written in Rust. Features length-prefixed binary framing, asynchronous channels, and a Ratatui TUI.",
      longDescription:
        "Alyson is a terminal-based TCP messaging and packet inspection tool written in Rust, designed for real-time socket inspection and multi-client communication.\n\nThe system decouples asynchronous network I/O from UI rendering using Rust `mpsc` channels and crossbeam primitives to maintain steady 60 FPS terminal performance.\n\nSystem architecture:\n- Transport Framing: Packages payloads into length-prefixed TCP binary frames with a 4-byte big-endian `u32` length header followed by serialized Bincode buffers.\n- Terminal User Interface: Built with `Ratatui` and `crossterm` to display interactive client lists, live connection status, and formatted message inspection feeds.\n- Concurrency Model: Worker threads handle socket reading and writing independently, preventing network bottlenecks from blocking UI event loops.",
      tags: ["Rust", "Ratatui", "TCP", "Async", "TUI", "Networking"],
      status: "experimental",
      year: "2024",
      repoUrl: "https://github.com/mnasies/alyson",
    },
  ],
};
