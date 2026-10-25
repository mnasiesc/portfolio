"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

interface HtopMonitorProps {
  onExit: () => void;
}

interface ProcessItem {
  pid: number;
  user: string;
  pri: number;
  ni: number;
  virt: string;
  res: string;
  cpu: number;
  mem: number;
  time: string;
  command: string;
}

const INITIAL_PROCESSES: ProcessItem[] = [
  { pid: 1042, user: "mnasie", pri: 20, ni: 0, virt: "1.4G", res: "182M", cpu: 14.8, mem: 1.2, time: "02:41.12", command: "flowhook --daemon /sys/fs" },
  { pid: 1088, user: "mnasie", pri: 20, ni: 0, virt: "820M", res: "114M", cpu: 8.5, mem: 0.8, time: "00:54.08", command: "wal-engine --sync-disk" },
  { pid: 1105, user: "mnasie", pri: 20, ni: 0, virt: "450M", res: "64M", cpu: 5.1, mem: 0.4, time: "01:12.30", command: "inotify-watcher -r /src" },
  { pid: 1240, user: "mnasie", pri: 20, ni: 0, virt: "1.8G", res: "320M", cpu: 3.4, mem: 2.1, time: "04:19.45", command: "nvim src/main.cpp" },
  { pid: 1312, user: "mnasie", pri: 20, ni: 0, virt: "120M", res: "18M", cpu: 1.2, mem: 0.1, time: "00:08.90", command: "zsh" },
  { pid: 1450, user: "mnasie", pri: 20, ni: 0, virt: "85M", res: "12M", cpu: 0.8, mem: 0.1, time: "00:02.15", command: "phosphor-terminal --standalone" },
  { pid: 1520, user: "system", pri: 19, ni: -5, virt: "2.1G", res: "410M", cpu: 2.4, mem: 2.8, time: "18:22.04", command: "systemd-journald" },
  { pid: 1610, user: "root", pri: 20, ni: 0, virt: "310M", res: "42M", cpu: 0.2, mem: 0.3, time: "00:15.80", command: "/usr/lib/systemd/systemd-udevd" },
];

function renderMeterBar(percentage: number, totalChars = 20): string {
  const filled = Math.min(totalChars, Math.max(0, Math.round((percentage / 100) * totalChars)));
  const empty = totalChars - filled;
  return `[${"|".repeat(filled)}${" ".repeat(empty)}]`;
}

export function HtopMonitor({ onExit }: HtopMonitorProps) {
  // Detect real hardware concurrency (cores)
  const cpuCoreCount = useMemo(() => {
    if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
      return Math.min(16, Math.max(2, navigator.hardwareConcurrency));
    }
    return 8;
  }, []);

  // Detect approximate device memory
  const ramGb = useMemo(() => {
    if (typeof navigator !== "undefined" && "deviceMemory" in navigator) {
      return (navigator as { deviceMemory?: number }).deviceMemory || 16;
    }
    return 16;
  }, []);

  const [coreLoads, setCoreLoads] = useState<number[]>(() =>
    Array.from({ length: cpuCoreCount }, () => Math.floor(20 + Math.random() * 50)),
  );
  const [usedMem, setUsedMem] = useState(3.42);
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "q" || e.key === "Q" || e.key === "Escape" || (e.ctrlKey && e.key.toLowerCase() === "c")) {
        e.preventDefault();
        onExit();
      }
    },
    [onExit],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Live ticks every 800ms
  useEffect(() => {
    const interval = setInterval(() => {
      // Jiggle CPU cores
      setCoreLoads((prev) =>
        prev.map((c) => {
          const delta = (Math.random() - 0.5) * 18;
          return Math.min(98, Math.max(4, Math.round(c + delta)));
        }),
      );

      // Jiggle memory
      setUsedMem((prev) => {
        const delta = (Math.random() - 0.5) * 0.15;
        return Number(Math.max(1.8, Math.min(ramGb * 0.9, prev + delta)).toFixed(2));
      });

      // Jiggle processes
      setProcesses((prev) =>
        prev.map((p) => {
          if (p.pid < 1500) {
            const cpuDelta = (Math.random() - 0.5) * 4;
            return {
              ...p,
              cpu: Number(Math.max(0.1, Math.min(85, p.cpu + cpuDelta)).toFixed(1)),
            };
          }
          return p;
        }),
      );
    }, 800);

    return () => clearInterval(interval);
  }, [ramGb]);

  const memPercent = Math.round((usedMem / ramGb) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black text-stone-200 font-mono flex flex-col p-3 sm:p-5 select-none overflow-hidden text-xs sm:text-sm">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-800 bg-black/90">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-emerald-400 dark:text-[#8dff55]">
            HTOP 3.3.0 · PROCESS MONITOR [SIMULATED DAEMONS · REAL {cpuCoreCount}-CORE DETECTION]
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-stone-400 text-xs hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-200">q</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-200">ESC</kbd> to exit
          </span>
          <button
            type="button"
            onClick={onExit}
            className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-xs font-bold cursor-pointer"
          >
            QUIT [q]
          </button>
        </div>
      </div>

      {/* Hardware Core Meters & Memory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 pb-3 mb-3 border-b border-stone-800 text-[11px] sm:text-xs">
        {/* Left Column: Cores */}
        <div className="space-y-0.5">
          {coreLoads.slice(0, Math.ceil(cpuCoreCount / 2)).map((load, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-5 text-stone-400">{idx + 1}</span>
              <span className="text-emerald-400 dark:text-[#8dff55]">
                {renderMeterBar(load, 18)}
              </span>
              <span className="w-12 text-right font-bold text-stone-100">{load}.0%</span>
            </div>
          ))}
        </div>

        {/* Right Column: Other Cores + Memory */}
        <div className="space-y-0.5">
          {coreLoads.slice(Math.ceil(cpuCoreCount / 2)).map((load, idx) => {
            const actualIndex = Math.ceil(cpuCoreCount / 2) + idx;
            return (
              <div key={actualIndex} className="flex items-center gap-2">
                <span className="w-5 text-stone-400">{actualIndex + 1}</span>
                <span className="text-emerald-400 dark:text-[#8dff55]">
                  {renderMeterBar(load, 18)}
                </span>
                <span className="w-12 text-right font-bold text-stone-100">{load}.0%</span>
              </div>
            );
          })}
          <div className="flex items-center gap-2 pt-1 border-t border-stone-900">
            <span className="w-5 text-cyan-400 font-bold">Mem</span>
            <span className="text-cyan-400">{renderMeterBar(memPercent, 18)}</span>
            <span className="text-stone-300">
              {usedMem}G / {ramGb}.0G
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 text-amber-400 font-bold">Swp</span>
            <span className="text-amber-400">{renderMeterBar(12, 18)}</span>
            <span className="text-stone-400">128M / 4.00G</span>
          </div>
        </div>
      </div>

      {/* System Summary Bar */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 pb-2">
        <div>
          Tasks: <span className="text-stone-100 font-bold">{processes.length + 34}</span> total,{" "}
          <span className="text-emerald-400 font-bold">2</span> running
        </div>
        <div>
          Load average: <span className="text-stone-200">1.24 0.98 0.81</span> · Uptime:{" "}
          <span className="text-stone-200">6 days, 04:18:22</span>
        </div>
      </div>

      {/* Process Table Header */}
      <div className="bg-stone-900 text-stone-200 px-2 py-1 font-bold text-[11px] sm:text-xs flex items-center">
        <span className="w-14">PID</span>
        <span className="w-20">USER</span>
        <span className="w-10">PRI</span>
        <span className="w-10">NI</span>
        <span className="w-16">VIRT</span>
        <span className="w-16">RES</span>
        <span className="w-14 text-right pr-2">%CPU</span>
        <span className="w-14 text-right pr-2">%MEM</span>
        <span className="w-20">TIME+</span>
        <span className="flex-1">COMMAND</span>
      </div>

      {/* Process Table Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-900/60 font-mono text-[11px] sm:text-xs scrollbar-none">
        {processes.map((p) => (
          <div
            key={p.pid}
            className="flex items-center px-2 py-0.5 hover:bg-stone-900/50 transition-colors"
          >
            <span className="w-14 text-stone-400">{p.pid}</span>
            <span className="w-20 text-emerald-400/90">{p.user}</span>
            <span className="w-10 text-stone-500">{p.pri}</span>
            <span className="w-10 text-stone-500">{p.ni}</span>
            <span className="w-16 text-stone-300">{p.virt}</span>
            <span className="w-16 text-stone-300">{p.res}</span>
            <span className="w-14 text-right pr-2 font-bold text-emerald-400 dark:text-[#8dff55]">
              {p.cpu.toFixed(1)}
            </span>
            <span className="w-14 text-right pr-2 text-stone-300">{p.mem.toFixed(1)}</span>
            <span className="w-20 text-stone-400">{p.time}</span>
            <span className="flex-1 truncate text-stone-100 font-semibold">{p.command}</span>
          </div>
        ))}
      </div>

      {/* Footer Hotkeys */}
      <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center gap-3 text-[10px] sm:text-[11px] text-stone-500">
        <span><kbd className="px-1 py-0.2 bg-stone-900 text-stone-300 border border-stone-800 rounded">q</kbd> Quit</span>
        <span><kbd className="px-1 py-0.2 bg-stone-900 text-stone-300 border border-stone-800 rounded">F1</kbd> Help</span>
        <span><kbd className="px-1 py-0.2 bg-stone-900 text-stone-300 border border-stone-800 rounded">F5</kbd> Tree</span>
        <span><kbd className="px-1 py-0.2 bg-stone-900 text-stone-300 border border-stone-800 rounded">F9</kbd> Kill</span>
        <span><kbd className="px-1 py-0.2 bg-stone-900 text-stone-300 border border-stone-800 rounded">F10</kbd> Exit</span>
      </div>
    </div>
  );
}
