---
title: "Building a Recursive Filewatcher with Build Output Awareness Capability in C++"
excerpt: "How I engineered FlowHook—a lightweight C++ file watcher CLI using Linux inotify featuring build-output awareness, contextual branching (on_success / on_failure), and session persistence across reboots."
date: "2025-02-15"
readingTime: "5 min read"
category: "Systems & C++"
tags: ["C++", "Linux", "inotify", "CLI", "FlowHook"]
canonicalUrl: "https://kernel-thoughts.hashnode.dev/building-a-recursive-filewatcher-with-build-output-awareness-capability-in-c"
featured: true
---

> *Published on Kernel Thoughts (Hashnode). Read original article at [kernel-thoughts.hashnode.dev](https://kernel-thoughts.hashnode.dev/building-a-recursive-filewatcher-with-build-output-awareness-capability-in-c).*

Building efficient developer CLI tools requires balancing low-level OS event performance with minimal CPU footprint. When automating local build loops, existing watchers either depend on heavy runtime environments (Node.js/Python) or lack durable state persistence across system reboots.

### The Core Problem in Developer Feedback Loops

Standard file system notification APIs—such as Linux `inotify` or BSD `kqueue`—are inherently ephemeral. If a terminal session terminates or the computer restarts, active watchers vanish along with any execution context. 

To solve this, **FlowHook** was built with four primary principles:
1. **True Persistence**: FlowHook configurations are saved to a local config file. Once configured, running `flowhook run` restores session parameters across system reboots.
2. **Contextual Branching (`on_success` / `on_failure`)**: Attach distinct command pipelines based on the exit code of the previous build. Use cases include running lightweight unit tests on build success vs. triggering desktop notifications on build failure.
3. **Language Agnostic**: Built in native C++17/20, FlowHook is completely toolchain agnostic. It monitors C++, TypeScript, Rust, Python, or Go projects effortlessly.
4. **Session Logging**: Automatically records build output history into `<PROJECT_NAME>-flowhook.log` within your project root for easy debugging.

```text
  ███████╗██╗      ██████╗ ██╗    ██╗██╗  ██╗ ██████╗  ██████╗ ██╗  ██╗    
  ██╔════╝██║     ██╔═══██╗██║    ██║██║  ██║██╔═══██╗██╔═══██╗██║ ██╔╝    
  █████╗  ██║     ██║   ██║██║ █╗ ██║███████║██║   ██║██║   ██║█████╔╝     
  ██╔══╝  ██║     ██║   ██║██║███╗██║██╔══██║██║   ██║██║   ██║██╔═██╗     
  ██║     ███████╗╚██████╔╝╚███╔███╔╝██║  ██║╚██████╔╝╚██████╔╝██║  ██╗    
  ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝    
```

### Inotify Event Loop & Recursive Watching

Using Linux `inotify_add_watch`, FlowHook listens for `IN_MODIFY`, `IN_CREATE`, and `IN_DELETE` events. To prevent notification storms during rapid file saves, an in-memory debounce window filters duplicate triggers within a 150ms window.

```cpp
// Debounce logic snippet in FlowHook event loop
if (currentTime - lastTriggerTime < std::chrono::milliseconds(150)) {
    return; // Ignore duplicate event burst
}
lastTriggerTime = currentTime;
```

### Key Takeaways

- **Dynamic Subdirectory Registration**: `inotify` does not natively recurse into newly created subdirectories without manual descriptors. FlowHook hooks `IN_CREATE` on directory paths to dynamically register new subfolders.
- **Process Management**: Spawning non-blocking subprocesses using `fork` and `execvp` ensures the main watch loop remains responsive even during long-running builds.
