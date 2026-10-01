---
title: "Building FlowHook: A Lightweight C++ File Watcher with State Persistence"
excerpt: "How I engineered a zero-dependency CLI tool in C++ that monitors directory changes, executes conditional build pipelines, and retains state across reboot cycles."
date: "2026-09-28"
readingTime: "5 min read"
category: "Systems"
tags: ["C++", "CLI", "File System", "Linux"]
featured: true
---

Building efficient developer CLI tools requires balancing performance with minimal OS footprint. When automating local build loops, existing watchers either depend on heavy runtimes (Node.js/Python) or lack durable state persistence across system reboots.

### The Core Problem

Standard file system notification APIs—such as Linux `inotify` or BSD `kqueue`—are inherently ephemeral. If a terminal session dies or the computer restarts, active watchers vanish along with any execution context. 

To solve this, **FlowHook** was built with three primary principles:
1. **Zero External Dependencies**: Pure C++ standard library with native POSIX syscalls.
2. **Conditional Execution Branching**: Trigger distinct success or failure command chains based on tool exit codes.
3. **Persistent Watch Registry**: Store active watch descriptors and rule configurations in a local binary/JSON state file.

### Architecture Breakdown

FlowHook operates via a clean polling/event event-loop architecture. Here is a high-level overview of how the event loop translates file system signals into actions:

```
+------------------+      +---------------------+      +---------------------+
| File System Path | ---> | Inotify Event Loop  | ---> | Rule Matcher        |
+------------------+      +---------------------+      +---------------------+
                                                                  |
                                                                  v
                                                       +---------------------+
                                                       | Spawn Process       |
                                                       | (Branch Success/Fail|
                                                       +---------------------+
```

#### Event Handling & Filtering

Using Linux `inotify_add_watch`, FlowHook listens for `IN_MODIFY`, `IN_CREATE`, and `IN_DELETE` events. To prevent notification storms during rapid file saves, an in-memory debounce window filters out duplicate triggers within a 150ms window.

```cpp
// Debounce logic snippet in FlowHook event loop
if (currentTime - lastTriggerTime < std::chrono::milliseconds(150)) {
    return; // Ignore duplicate event burst
}
lastTriggerTime = currentTime;
```

### Lessons Learned

- **Handling Recursive Watches**: `inotify` does not natively recurse into newly created subdirectories without manual descriptors. FlowHook hooks `IN_CREATE` on directory paths to dynamically register subfolders.
- **Process Management**: Spawning non-blocking subprocesses using `fork` and `execvp` ensures the main watch loop remains responsive even during long-running builds.

FlowHook demonstrates how low-level systems programming in C++ can produce tiny, reliable developer utilities with near-zero resource consumption.
