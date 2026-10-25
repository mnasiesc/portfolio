"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface BusyStreamProps {
  onExit: () => void;
}

const KERNEL_LOGS = [
  "  CC      kernel/sched/core.o",
  "  CC      kernel/sched/loadavg.o",
  "  CC      kernel/sched/clock.o",
  "  CC      kernel/locking/mutex.o",
  "  CC      fs/notify/inotify/inotify_user.o",
  "  CC      fs/notify/inotify/inotify_fsnotify.o",
  "  CC      fs/epoll.o",
  "  CC      arch/x86/kernel/entry_64.o",
  "  CC      arch/x86/kernel/traps.o",
  "  CC      arch/x86/kernel/irq.o",
  "  AR      arch/x86/kernel/built-in.a",
  "  LD [M]  drivers/net/ethernet/intel/e1000/e1000.o",
  "  CC [M]  drivers/char/random.o",
  "  CC      mm/memory.o",
  "  CC      mm/mmap.o",
  "  CC      mm/page_alloc.o",
  "  CC      mm/vmalloc.o",
  "  LD      vmlinux.o",
  "  MODPOST Module.symvers",
  "  CC      arch/x86/boot/compressed/head_64.o",
  "  CC      arch/x86/boot/compressed/misc.o",
  "  OBJCOPY arch/x86/boot/vmlinux.bin",
  "  BUILD   arch/x86/boot/bzImage (Kernel: arch/x86/boot/bzImage is ready)",
];

const DOWNLOAD_LOGS = [
  "[fetch] downloading pkg: clang-tools-extra-18.1.8-x86_64.pkg.tar.zst (84.2 MB)...",
  "  -> [██████████████████████░░░░░░░░] 74% 28.4 MB/s ETA 00:01",
  "  -> [██████████████████████████████] 100% 32.1 MB/s [DONE] SHA256 verified.",
  "[git] cloning repository: https://github.com/torvalds/linux.git --depth=1",
  "remote: Enumerating objects: 82140, done.",
  "remote: Counting objects: 100% (82140/82140), done.",
  "remote: Compressing objects: 100% (64120/64120), done.",
  "Receiving objects:  92% (75568/82140), 184.20 MiB | 24.12 MiB/s",
  "Resolving deltas: 100% (24110/24110), done.",
  "[wal] syncing write-ahead-log segment 0x00004f21 -> fsync(fd) latency: 0.12ms",
  "[flowhook] active epoll_wait cycle: 42 files watched, inotify_mask: IN_MODIFY | IN_CREATE",
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
  const [logs, setLogs] = useState<string[]>([
    "[SIMULATOR BOOT] Initiating parallel build & sync pipeline...",
    "System target: x86_64-pc-linux-gnu · Opt-level: -O3",
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const snippetIdx = useRef(0);

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
      setLogs((prev) => [...prev.slice(-150), `>>> ${code}`]);
    },
    [onExit],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Autonomous fast stream of compile & download logs
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      let newLog = "";
      if (count % 3 === 0) {
        newLog = DOWNLOAD_LOGS[Math.floor(Math.random() * DOWNLOAD_LOGS.length)];
      } else {
        newLog = KERNEL_LOGS[Math.floor(Math.random() * KERNEL_LOGS.length)];
      }

      setLogs((prev) => [...prev.slice(-150), newLog]);
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [logs]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-stone-200 font-mono flex flex-col p-3 sm:p-6 select-none overflow-hidden">
      {/* Top HUD */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-800 text-xs sm:text-sm bg-black/95">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-emerald-400 dark:text-[#8dff55]">
            BUSY SIMULATOR // HIGH WORKLOAD STREAM
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
      <div className="flex-1 overflow-y-auto space-y-1 text-xs sm:text-sm font-mono scrollbar-none">
        {logs.map((line, idx) => (
          <div
            key={idx}
            className={
              line.startsWith(">>>")
                ? "text-emerald-300 dark:text-[#8dff55] font-bold"
                : line.includes("BUILD") || line.includes("[DONE]")
                  ? "text-cyan-400 font-semibold"
                  : line.includes("fetch") || line.includes("git")
                    ? "text-amber-400"
                    : "text-stone-400"
            }
          >
            {line}
          </div>
        ))}
        <div ref={bottomRef} className="h-6" />
      </div>
    </div>
  );
}
