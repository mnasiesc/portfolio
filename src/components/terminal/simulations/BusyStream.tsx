"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface BusyStreamProps {
  onExit: () => void;
}

interface StreamLine {
  id: number;
  text: string;
  highlight?: "cmd" | "download" | "success" | "warn" | "dim" | "hacker";
}

// Heavy C++ & Kernel compilation bursts
const FAST_COMPILER_FILES = [
  "kernel/sched/core.o",
  "kernel/sched/loadavg.o",
  "kernel/sched/clock.o",
  "kernel/sched/cputime.o",
  "kernel/sched/idle.o",
  "kernel/sched/fair.o",
  "kernel/sched/rt.o",
  "kernel/sched/deadline.o",
  "kernel/locking/mutex.o",
  "kernel/locking/rwsem.o",
  "kernel/locking/spinlock.o",
  "fs/notify/inotify/inotify_user.o",
  "fs/notify/inotify/inotify_fsnotify.o",
  "fs/epoll.o",
  "fs/eventfd.o",
  "fs/timerfd.o",
  "arch/x86/kernel/entry_64.o",
  "arch/x86/kernel/traps.o",
  "arch/x86/kernel/irq.o",
  "mm/memory.o",
  "mm/mmap.o",
  "mm/page_alloc.o",
  "mm/vmalloc.o",
  "drivers/char/random.o",
  "drivers/base/core.o",
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

function renderProgressBar(percentage: number, totalChars = 24): string {
  const filled = Math.min(totalChars, Math.max(0, Math.round((percentage / 100) * totalChars)));
  const empty = totalChars - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}]`;
}

export function BusyStream({ onExit }: BusyStreamProps) {
  const [lines, setLines] = useState<StreamLine[]>([
    { id: 1, text: "[SIMULATOR BOOT] Initiating parallel worker pipeline (threads: 16)...", highlight: "cmd" },
    { id: 2, text: "Target: x86_64-pc-linux-gnu · Dynamic organic pacing engine", highlight: "dim" },
  ]);

  const idCounter = useRef(3);
  const bottomRef = useRef<HTMLDivElement>(null);
  const snippetIdx = useRef(0);

  // Append new line to logs
  const appendLine = useCallback((text: string, highlight?: StreamLine["highlight"]) => {
    const newId = idCounter.current++;
    setLines((prev) => [...prev.slice(-150), { id: newId, text, highlight }]);
    return newId;
  }, []);

  // Update existing line in place (used for in-place download progress bars)
  const updateLineInPlace = useCallback((lineId: number, text: string, highlight?: StreamLine["highlight"]) => {
    setLines((prev) =>
      prev.map((item) => (item.id === lineId ? { ...item, text, highlight: highlight || item.highlight } : item)),
    );
  }, []);

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
      appendLine(`>>> ${code}`, "hacker");
    },
    [appendLine, onExit],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Main Async Orchestrator with HUGE Speed Variation
  useEffect(() => {
    let isMounted = true;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          if (isMounted) resolve();
        }, ms);
        return () => clearTimeout(timer);
      });

    const runSimulationLoop = async () => {
      while (isMounted) {
        // ── 1. SUPER FAST COMPILER BURST (15ms - 35ms per line!) ────────────────
        appendLine(":: CC [fast-pass] Compiling scheduler & core kernel objects...", "cmd");
        await sleep(180);

        for (let i = 0; i < 14; i++) {
          if (!isMounted) return;
          const file = FAST_COMPILER_FILES[Math.floor(Math.random() * FAST_COMPILER_FILES.length)];
          appendLine(`  CC      ${file}`);
          // Blazing fast ms speed:
          await sleep(Math.floor(18 + Math.random() * 25));
        }

        // ── 2. INSTANT TINY PACKAGE DOWNLOAD (30ms - 80ms) ─────────────────────
        if (!isMounted) return;
        appendLine(":: Fetching patch-6.12.8-arch1.patch (18.4 KiB)...", "dim");
        await sleep(40);
        appendLine("  -> [████████████████████████] 100% 18.4 KiB in 0.02s [VERIFIED]", "success");
        await sleep(150);

        // ── 3. SUPER SLOW HEAVY COMPILATION PAUSE (3,000ms - 4,000ms!) ──────────
        if (!isMounted) return;
        appendLine("  CXX     drivers/gpu/drm/nouveau/nouveau_bo.cpp [generating SIMD templates & LTO pass]...", "warn");
        // Realistic long hang while compiling heavy template code
        await sleep(3400);
        if (!isMounted) return;
        appendLine("  AR      drivers/gpu/drm/nouveau/built-in.a (LTO optimized: 42.8 MB)", "dim");
        await sleep(220);

        // Another heavy compile file
        if (!isMounted) return;
        appendLine("  CXX     llvm/lib/Target/X86/X86ISelLowering.cpp [optimizing pass 4 of 4]...", "warn");
        await sleep(2600);
        if (!isMounted) return;
        appendLine("  LD      llvm/lib/Target/X86/built-in.a", "dim");
        await sleep(300);

        // ── 4. REAL SLOW 1.2GB DOWNLOAD WITH IN-PLACE BAR UPDATING ──────────────
        if (!isMounted) return;
        appendLine(":: Downloading linux-firmware-20241018.tar.zst (1.2 GiB) from mirror.kernel.org...", "cmd");
        await sleep(600);
        if (!isMounted) return;

        // Create the single in-place progress bar line
        const barLineId = appendLine("  -> [░░░░░░░░░░░░░░░░░░░░░░░░]   0%   0.0 MiB/s  ETA --:--", "download");
        await sleep(400);

        // Realistic slow crawl for 1.2GB file, updating the EXACT same line in place!
        let percent = 0;
        let downloadedMb = 0;
        const totalMb = 1240;

        while (percent < 100 && isMounted) {
          const increment = Math.floor(4 + Math.random() * 7); // 4% to 10% per tick
          percent = Math.min(100, percent + increment);
          downloadedMb = Math.min(totalMb, Math.round((percent / 100) * totalMb));
          const speed = (2.2 + Math.random() * 1.8).toFixed(1); // 2.2 - 4.0 MiB/s
          const remainingSecs = Math.max(0, Math.round(((totalMb - downloadedMb) / Number(speed))));
          const mins = String(Math.floor(remainingSecs / 60)).padStart(2, "0");
          const secs = String(remainingSecs % 60).padStart(2, "0");
          const bar = renderProgressBar(percent, 24);

          // Update in-place:
          updateLineInPlace(
            barLineId,
            `  -> ${bar} ${String(percent).padStart(3, " ")}%  ${speed} MiB/s  ${downloadedMb}/${totalMb} MiB  ETA ${mins}:${secs}`,
            percent === 100 ? "success" : "download",
          );

          // Realistic download interval: takes ~600ms - 900ms per tick
          await sleep(Math.floor(600 + Math.random() * 300));
        }

        if (!isMounted) return;
        updateLineInPlace(
          barLineId,
          `  -> [████████████████████████] 100%  3.4 MiB/s  1.2 GiB [COMPLETED] SHA512 verified.`,
          "success",
        );
        await sleep(500);

        // Verifying and uncompressing delay
        appendLine("[unpack] validating SHA512 checksum of 1.2 GiB archive...", "dim");
        await sleep(1400);
        if (!isMounted) return;
        appendLine("[unpack] extracting 12,410 firmware binaries to /lib/firmware...", "warn");
        await sleep(2200);
        if (!isMounted) return;
        appendLine("[system] firmware installation completed successfully.", "success");
        await sleep(400);

        // ── 5. MODERATE-SPEED GIT CLONE & WAL ENGINE (150ms - 400ms) ───────────
        if (!isMounted) return;
        appendLine("[git] cloning https://github.com/torvalds/linux.git --depth=1", "cmd");
        await sleep(500);
        if (!isMounted) return;

        // In-place updating for git objects
        const gitLineId = appendLine("remote: Receiving objects:   8% (336/4210) | 4.2 MiB/s", "download");
        await sleep(350);
        if (!isMounted) return;
        updateLineInPlace(gitLineId, "remote: Receiving objects:  44% (1852/4210) | 12.8 MiB/s", "download");
        await sleep(350);
        if (!isMounted) return;
        updateLineInPlace(gitLineId, "remote: Receiving objects:  82% (3452/4210) | 16.4 MiB/s", "download");
        await sleep(300);
        if (!isMounted) return;
        updateLineInPlace(gitLineId, "remote: Receiving objects: 100% (4210/4210), 18.40 MiB | 18.20 MiB/s, done.", "success");
        await sleep(400);

        if (!isMounted) return;
        appendLine("[wal] syncing write-ahead-log segment 0x00004f21 -> fsync(fd) latency: 0.14ms");
        await sleep(250);
        if (!isMounted) return;
        appendLine("[flowhook] active epoll_wait cycle: 1,280 directories watched, inotify_mask: IN_MODIFY | IN_CREATE");
        await sleep(350);
        if (!isMounted) return;
        appendLine("  BUILD   arch/x86/boot/bzImage (Kernel: arch/x86/boot/bzImage is ready)", "success");
        await sleep(1000);
      }
    };

    runSimulationLoop();

    return () => {
      isMounted = false;
    };
  }, [appendLine, updateLineInPlace]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-stone-200 font-mono flex flex-col p-3 sm:p-6 select-none overflow-hidden">
      {/* Top HUD */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-800 text-xs sm:text-sm bg-black/95">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-emerald-400 dark:text-[#8dff55]">
            BUSY SIMULATOR // ORGANIC PACING & IN-PLACE DOWNLOADS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-stone-400 text-xs hidden md:inline">
            Mash any key to fake-type C++ code · Press <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-200">q</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-200">ESC</kbd>
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
        {lines.map((item) => (
          <div
            key={item.id}
            className={
              item.highlight === "hacker"
                ? "text-emerald-300 dark:text-[#8dff55] font-bold"
                : item.highlight === "cmd"
                  ? "text-cyan-400 font-bold"
                  : item.highlight === "download"
                    ? "text-amber-300 font-mono"
                    : item.highlight === "success"
                      ? "text-emerald-400 font-semibold font-mono"
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
