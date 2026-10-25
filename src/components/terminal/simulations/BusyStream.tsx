"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface BusyStreamProps {
  onExit: () => void;
}

interface LogStep {
  text: string;
  delayMs: number;
  highlight?: "cmd" | "download" | "success" | "warn" | "dim";
}

const GENERATOR_PIPELINE: LogStep[] = [
  { text: "[pipeline] initiating compilation worker pools (threads: 8)...", delayMs: 400, highlight: "cmd" },
  { text: "  CC      kernel/sched/core.o", delayMs: 280 },
  { text: "  CC      kernel/sched/loadavg.o", delayMs: 220 },
  { text: "  CC      kernel/sched/clock.o", delayMs: 180 },
  { text: "  CC      kernel/locking/mutex.o", delayMs: 250 },
  { text: "  CC      fs/notify/inotify/inotify_user.o", delayMs: 320 },
  { text: "  CC      fs/notify/inotify/inotify_fsnotify.o", delayMs: 260 },
  { text: "  CC      fs/epoll.o", delayMs: 350 },
  { text: "  CC      arch/x86/kernel/entry_64.o", delayMs: 420 },
  { text: "  CC      arch/x86/kernel/traps.o", delayMs: 290 },
  { text: "  CC      drivers/gpu/drm/nouveau/nouveau_bo.o [compiling templates...]", delayMs: 1200, highlight: "warn" },
  { text: "  AR      arch/x86/kernel/built-in.a", delayMs: 380 },
  
  // Package download phase (realistic pauses and speeds)
  { text: ":: Synchronizing package databases...", delayMs: 700, highlight: "cmd" },
  { text: ":: Starting dependency verification & package resolution...", delayMs: 650 },
  { text: "resolving dependencies (3 packages)...", delayMs: 800 },
  { text: "Packages (3) clang-18.1.8-1  llvm-libs-18.1.8-1  rust-1.80.0-1", delayMs: 900, highlight: "dim" },
  { text: "[fetch] downloading clang-18.1.8-x86_64.pkg.tar.zst (84.2 MiB)...", delayMs: 500, highlight: "download" },
  { text: "  -> [████░░░░░░░░░░░░░░░░░░░░] 16%  3.8 MiB/s  ETA 00:18", delayMs: 450, highlight: "download" },
  { text: "  -> [████████░░░░░░░░░░░░░░░░] 35%  5.4 MiB/s  ETA 00:10", delayMs: 500, highlight: "download" },
  { text: "  -> [█████████████░░░░░░░░░░░] 56%  6.8 MiB/s  ETA 00:06", delayMs: 480, highlight: "download" },
  { text: "  -> [██████████████████░░░░░░] 78%  7.2 MiB/s  ETA 00:03", delayMs: 420, highlight: "download" },
  { text: "  -> [████████████████████████] 100% 7.6 MiB/s  [COMPLETED] 84.2 MiB in 00:11.2", delayMs: 700, highlight: "success" },
  { text: "checking keys in keyring...", delayMs: 550 },
  { text: "checking package integrity (sha256)...", delayMs: 750, highlight: "dim" },
  { text: "loading package files & unpacking zstd archives...", delayMs: 1100, highlight: "warn" },
  { text: "installing clang-18.1.8... [████████████████████] 100%", delayMs: 450, highlight: "success" },
  
  // Git & WAL engine phase
  { text: "[git] syncing submodules from github.com/torvalds/linux.git --depth=1", delayMs: 800, highlight: "cmd" },
  { text: "remote: Enumerating objects: 4210, done.", delayMs: 380 },
  { text: "remote: Counting objects: 100% (4210/4210), done.", delayMs: 320 },
  { text: "remote: Compressing objects: 100% (3120/3120), done.", delayMs: 450 },
  { text: "Receiving objects:  84% (3536/4210), 18.40 MiB | 14.20 MiB/s", delayMs: 550, highlight: "download" },
  { text: "Resolving deltas: 100% (1640/1640), done.", delayMs: 420 },
  { text: "[wal] flushing write-ahead-log segment 0x00004f21 -> fsync(fd) latency: 0.14ms", delayMs: 360 },
  { text: "[flowhook] active epoll_wait cycle: 1,280 directories watched, inotify_mask: IN_MODIFY | IN_CREATE", delayMs: 480 },
  { text: "  LD      vmlinux.o", delayMs: 600 },
  { text: "  MODPOST Module.symvers", delayMs: 750, highlight: "dim" },
  { text: "  BUILD   arch/x86/boot/bzImage (Kernel: arch/x86/boot/bzImage is ready)", delayMs: 900, highlight: "success" },
];

const HACKER_CODE_SNIPPETS = [
  "int inotify_fd = inotify_init1(IN_NONBLOCK | IN_CLOEXEC);",
  "if (inotify_fd < 0) { perror(\"inotify_init1\"); return -errno; }",
  "struct epoll_event ev{}; ev.events = EPOLLIN | EPOLLET; ev.data.fd = inotify_fd;",
  "epoll_ctl(epoll_fd, EPOLL_CTL_ADD, inotify_fd, &ev);",
  "// WAL Entry: serialize segment header",
  "wal_header.crc32 = crc32_checksum(payload, payload_size);",
  "pwrite64(wal_fd, &wal_header, sizeof(wal_header), current_offset);",
  "fsync(wal_fd);",
  "template <typename T> requires std::is_trivial_v<T>",
  "void ring_buffer_push(const T& item) noexcept {",
  "    const auto head = head_.load(std::memory_order_relaxed);",
  "    buffer_[head & buffer_mask_] = item;",
  "    head_.store(head + 1, std::memory_order_release);",
  "}",
];

export function BusyStream({ onExit }: BusyStreamProps) {
  const [logs, setLogs] = useState<Array<{ id: number; text: string; highlight?: string }>>([
    { id: 1, text: "[SIMULATOR BOOT] Initiating compiler pipeline & package synchronizer...", highlight: "cmd" },
    { id: 2, text: "System target: x86_64-pc-linux-gnu · Opt-level: -O3 · Pacing: Organic", highlight: "dim" },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const snippetIdx = useRef(0);
  const logIdCounter = useRef(3);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Exit conditions
      if (e.key === "q" || e.key === "Q" || e.key === "Escape" || (e.ctrlKey && e.key.toLowerCase() === "c")) {
        e.preventDefault();
        onExit();
        return;
      }

      // Any other keystroke: Hacker Typer injection!
      e.preventDefault();
      const code = HACKER_CODE_SNIPPETS[snippetIdx.current % HACKER_CODE_SNIPPETS.length];
      snippetIdx.current++;
      setLogs((prev) => [
        ...prev.slice(-120),
        { id: logIdCounter.current++, text: `>>> ${code}`, highlight: "hacker" },
      ]);
    },
    [onExit],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Organic paced stream with realistic pauses
  useEffect(() => {
    let isMounted = true;
    let stepIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const runNextStep = () => {
      if (!isMounted) return;

      const step = GENERATOR_PIPELINE[stepIndex % GENERATOR_PIPELINE.length];
      stepIndex++;

      setLogs((prev) => [
        ...prev.slice(-120),
        { id: logIdCounter.current++, text: step.text, highlight: step.highlight },
      ]);

      // Schedule next step with step-specific delay
      timeoutId = setTimeout(runNextStep, step.delayMs);
    };

    timeoutId = setTimeout(runNextStep, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-stone-200 font-mono flex flex-col p-3 sm:p-6 select-none overflow-hidden">
      {/* Top HUD */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-800 text-xs sm:text-sm bg-black/95">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-emerald-400 dark:text-[#8dff55]">
            BUSY SIMULATOR // ORGANIC WORKLOAD STREAM
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-stone-400 text-xs hidden md:inline">
            Mash any key to fake-type code · Press <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-200">q</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-200">ESC</kbd>
          </span>
          <button
            type="button"
            onClick={onExit}
            className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-xs font-bold cursor-pointer"
          >
            EXIT [q]
          </button>
        </div>
      </div>

      {/* Stream Area */}
      <div className="flex-1 overflow-y-auto space-y-1.5 text-xs sm:text-sm font-mono scrollbar-none leading-relaxed">
        {logs.map((item) => (
          <div
            key={item.id}
            className={
              item.highlight === "hacker"
                ? "text-emerald-300 dark:text-[#8dff55] font-bold"
                : item.highlight === "cmd"
                  ? "text-cyan-400 font-bold"
                  : item.highlight === "download"
                    ? "text-amber-300"
                    : item.highlight === "success"
                      ? "text-emerald-400 font-semibold"
                      : item.highlight === "warn"
                        ? "text-amber-400 italic"
                        : item.highlight === "dim"
                          ? "text-stone-500"
                          : "text-stone-400"
            }
          >
            {item.text}
          </div>
        ))}
        <div ref={bottomRef} className="h-6" />
      </div>
    </div>
  );
}
