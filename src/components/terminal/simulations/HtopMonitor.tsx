"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

interface HtopMonitorProps {
  onExit: () => void;
}

interface ProcessItem {
  pid: number;
  user: string;
  state: "R" | "S" | "D";
  pri: number;
  cpu: number;
  mem: number;
  ioRate: string;
  time: string;
  command: string;
}

const INITIAL_PROCESSES: ProcessItem[] = [
  { pid: 1042, user: "mnasie", state: "R", pri: 20, cpu: 14.8, mem: 1.4, ioRate: "4.2M/s", time: "03:14.22", command: "flowhook --daemon /sys/fs/inotify" },
  { pid: 1088, user: "mnasie", state: "S", pri: 20, cpu: 8.5, mem: 0.9, ioRate: "8.1M/s", time: "01:05.10", command: "wal-engine --sync --fsync-mode=wal" },
  { pid: 1105, user: "mnasie", state: "S", pri: 20, cpu: 5.1, mem: 0.4, ioRate: "0.2M/s", time: "00:44.80", command: "inotify-watcher -r /src/kernel" },
  { pid: 1240, user: "mnasie", state: "S", pri: 20, cpu: 3.4, mem: 2.1, ioRate: "0.0M/s", time: "05:22.01", command: "nvim src/lib/kernel/watcher.cpp" },
  { pid: 1312, user: "mnasie", state: "S", pri: 20, cpu: 1.2, mem: 0.1, ioRate: "0.0M/s", time: "00:12.33", command: "zsh --login (station)" },
  { pid: 1450, user: "mnasie", state: "R", pri: 20, cpu: 0.8, mem: 0.1, ioRate: "0.1M/s", time: "00:03.45", command: "phosphor-terminal --gpu-accel" },
  { pid: 1520, user: "system", state: "S", pri: 19, cpu: 2.4, mem: 2.8, ioRate: "1.4M/s", time: "18:22.04", command: "systemd-journald" },
  { pid: 1610, user: "root", state: "S", pri: 20, cpu: 0.2, mem: 0.3, ioRate: "0.0M/s", time: "00:15.80", command: "/usr/lib/systemd/systemd-udevd" },
];

function renderSidewayBar(percentage: number, totalChars = 14): { text: string; colorClass: string } {
  const filled = Math.min(totalChars, Math.max(0, Math.round((percentage / 100) * totalChars)));
  const empty = totalChars - filled;
  const bar = `[${"█".repeat(filled)}${"░".repeat(empty)}]`;
  const colorClass =
    percentage > 75
      ? "text-red-400 font-bold"
      : percentage > 45
        ? "text-amber-400 font-semibold"
        : "text-emerald-400 dark:text-[#8dff55]";
  return { text: bar, colorClass };
}

const SPARK_GLYPHS = [" ", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

function getSparkline(history: number[]): string {
  return history
    .map((val) => {
      const idx = Math.min(7, Math.max(0, Math.floor((val / 100) * 8)));
      return SPARK_GLYPHS[idx];
    })
    .join("");
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
    Array.from({ length: cpuCoreCount }, () => Math.floor(25 + Math.random() * 45)),
  );
  const [coreHistories, setCoreHistories] = useState<number[][]>(() =>
    Array.from({ length: cpuCoreCount }, () =>
      Array.from({ length: 8 }, () => Math.floor(20 + Math.random() * 50)),
    ),
  );

  const [usedMem, setUsedMem] = useState(5.4);
  const [cacheMem, setCacheMem] = useState(3.8);
  const [gpuLoad, setGpuLoad] = useState(44);
  const [gpuTemp, setGpuTemp] = useState(54);
  const [cpuTemp, setCpuTemp] = useState(51.8);
  const [pkgPower, setPkgPower] = useState(64.2);
  const [netRx, setNetRx] = useState(42.8);
  const [diskRead, setDiskRead] = useState(180);
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

  // Live telemetry pulse every 750ms
  useEffect(() => {
    const interval = setInterval(() => {
      // Jiggle CPU cores & histories
      setCoreLoads((prev) => {
        const next = prev.map((c) => {
          const delta = (Math.random() - 0.5) * 16;
          return Math.min(98, Math.max(5, Math.round(c + delta)));
        });

        setCoreHistories((prevHist) =>
          prevHist.map((hist, idx) => [...hist.slice(1), next[idx]]),
        );

        return next;
      });

      // Jiggle memory & cache
      setUsedMem((prev) => {
        const delta = (Math.random() - 0.5) * 0.18;
        return Number(Math.max(2.1, Math.min(ramGb * 0.6, prev + delta)).toFixed(2));
      });
      setCacheMem((prev) => {
        const delta = (Math.random() - 0.5) * 0.12;
        return Number(Math.max(1.5, Math.min(ramGb * 0.35, prev + delta)).toFixed(2));
      });

      // Jiggle temps & power
      setCpuTemp((prev) => Number((prev + (Math.random() - 0.5) * 0.8).toFixed(1)));
      setPkgPower((prev) => Number((prev + (Math.random() - 0.5) * 2.2).toFixed(1)));
      setGpuLoad((prev) => Math.min(95, Math.max(12, Math.round(prev + (Math.random() - 0.5) * 10))));
      setGpuTemp((prev) => Math.min(78, Math.max(45, Math.round(prev + (Math.random() - 0.5) * 1.5))));
      setNetRx((prev) => Number(Math.max(2.4, prev + (Math.random() - 0.5) * 8).toFixed(1)));
      setDiskRead((prev) => Math.min(650, Math.max(12, Math.round(prev + (Math.random() - 0.5) * 40))));

      // Jiggle process CPU
      setProcesses((prev) =>
        prev.map((p) => {
          if (p.pid < 1500) {
            const cpuDelta = (Math.random() - 0.5) * 3.5;
            return {
              ...p,
              cpu: Number(Math.max(0.2, Math.min(88, p.cpu + cpuDelta)).toFixed(1)),
            };
          }
          return p;
        }),
      );
    }, 750);

    return () => clearInterval(interval);
  }, [ramGb]);

  // Memory calculations for Pie Chart
  const usedPercent = Math.round((usedMem / ramGb) * 100);
  const cachePercent = Math.round((cacheMem / ramGb) * 100);
  const freePercent = Math.max(0, 100 - usedPercent - cachePercent);

  // SVG Pie/Doughnut geometry (circumference = 2 * PI * r)
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 10;
  const usedDash = (usedPercent / 100) * circumference;
  const cacheDash = (cachePercent / 100) * circumference;
  const freeDash = (freePercent / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 bg-black text-stone-200 font-mono flex flex-col p-2.5 sm:p-5 select-none overflow-y-auto text-xs scrollbar-none">
      {/* Top HUD Telemetry Banner */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-stone-800 bg-black/95 gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-emerald-400 dark:text-[#8dff55] tracking-wider">
            BTOP / HTOP PRO TELEMETRY · SYSTEM WORKSTATION
          </span>
          <span className="px-1.5 py-0.2 rounded bg-stone-900 border border-stone-800 text-[10px] text-stone-400">
            SIMULATED + REAL {cpuCoreCount}-CORE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-stone-400 text-[11px] hidden md:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-200">q</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-200">ESC</kbd> to quit
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

      {/* Node Hardware Sensors Header Line */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] p-2 rounded bg-stone-950 border border-stone-900 mb-3 text-stone-400">
        <div>
          HOST: <span className="text-stone-100 font-bold">mnasie-workstation</span> · KERNEL:{" "}
          <span className="text-cyan-400">6.12.8-custom-zen</span>
        </div>
        <div className="flex items-center gap-4">
          <div>
            CPU TEMP: <span className="text-emerald-400 font-bold">{cpuTemp}°C</span>
          </div>
          <div>
            TDP: <span className="text-amber-400 font-bold">{pkgPower}W</span>
          </div>
          <div>
            FAN: <span className="text-stone-300">1,840 RPM</span>
          </div>
          <div>
            UPTIME: <span className="text-stone-200 font-bold">6d 04:18:22</span>
          </div>
        </div>
      </div>

      {/* Upper Grid: Multicore Gauges (Left) + Memory Pie Chart & I/O (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
        {/* CPU Cores & Sparklines Panel (7 cols) */}
        <div className="lg:col-span-7 p-3 rounded bg-stone-950 border border-stone-900 space-y-2">
          <div className="flex items-center justify-between border-b border-stone-900 pb-1.5">
            <span className="font-bold text-stone-200 text-xs tracking-wider">
              CPU PROCESSOR UTILIZATION ({cpuCoreCount} LOGICAL THREADS)
            </span>
            <span className="text-[10px] text-stone-500">LIVE SPARKLINE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            {coreLoads.map((load, idx) => {
              const bar = renderSidewayBar(load, 12);
              const spark = getSparkline(coreHistories[idx]);
              return (
                <div key={idx} className="flex items-center justify-between gap-1 py-0.5">
                  <span className="w-10 text-stone-500 font-bold">C{idx < 9 ? `0${idx + 1}` : idx + 1}</span>
                  <span className={bar.colorClass}>{bar.text}</span>
                  <span className="w-10 text-right font-bold text-stone-200">{load}%</span>
                  <span className="text-emerald-400/80 font-mono tracking-tighter text-xs">{spark}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Memory Distribution with SVG Doughnut / Pie Chart (5 cols) */}
        <div className="lg:col-span-5 p-3 rounded bg-stone-950 border border-stone-900 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-stone-900 pb-1.5">
            <span className="font-bold text-stone-200 text-xs tracking-wider">
              MEMORY ALLOCATION DOUGHNUT
            </span>
            <span className="text-[10px] text-cyan-400 font-bold">{ramGb}.0 GB TOTAL</span>
          </div>

          {/* Pie Chart & Legend Row */}
          <div className="flex items-center justify-around gap-3 pt-1">
            {/* SVG Segmented Doughnut Chart */}
            <div className="relative shrink-0 flex items-center justify-center">
              <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                {/* Background Ring */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="transparent"
                  stroke="#1c1917"
                  strokeWidth={strokeWidth}
                />
                {/* Used Slice (Emerald) */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="transparent"
                  stroke="#8dff55"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${usedDash} ${circumference}`}
                  strokeDashoffset={0}
                  className="transition-all duration-500"
                />
                {/* Cache Slice (Cyan) */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="transparent"
                  stroke="#22d3ee"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${cacheDash} ${circumference}`}
                  strokeDashoffset={-usedDash}
                  className="transition-all duration-500"
                />
                {/* Free Slice (Muted Amber) */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="transparent"
                  stroke="#78716c"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${freeDash} ${circumference}`}
                  strokeDashoffset={-(usedDash + cacheDash)}
                  className="transition-all duration-500"
                />
              </svg>
              {/* Center readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xs font-bold text-stone-100">{usedPercent}%</span>
                <span className="text-[9px] text-stone-500 uppercase">Used</span>
              </div>
            </div>

            {/* Legend & GB values */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#8dff55]" />
                <span className="text-stone-300">App Workload:</span>
                <span className="font-bold text-stone-100 ml-auto">{usedMem} GiB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400" />
                <span className="text-stone-300">Buffer/Cache:</span>
                <span className="font-bold text-stone-100 ml-auto">{cacheMem} GiB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-stone-600" />
                <span className="text-stone-400">Available:</span>
                <span className="font-bold text-stone-300 ml-auto">
                  {(ramGb - usedMem - cacheMem).toFixed(1)} GiB
                </span>
              </div>
            </div>
          </div>

          {/* Sideway Memory & Swap Progress Bars */}
          <div className="space-y-1.5 pt-2 border-t border-stone-900 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-stone-400">RAM BAR</span>
              <span className="text-emerald-400 font-mono">
                {renderSidewayBar(usedPercent, 14).text}
              </span>
              <span className="font-bold text-stone-200">{usedPercent}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-400">SWAP</span>
              <span className="text-amber-400 font-mono">
                {renderSidewayBar(12, 14).text}
              </span>
              <span className="font-bold text-stone-300">480M / 4.0G</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Throughput Gauges (Disk IO, Network, GPU) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-[11px]">
        {/* Disk I/O */}
        <div className="p-2.5 rounded bg-stone-950 border border-stone-900 space-y-1.5">
          <div className="flex items-center justify-between border-b border-stone-900 pb-1">
            <span className="font-bold text-stone-300">NVMe STORAGE I/O</span>
            <span className="text-stone-500 text-[10px]">PCIe 4.0 x4</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">READ:</span>
            <span className="text-emerald-400 font-bold">{diskRead} MB/s</span>
            <span className="text-emerald-400 font-mono">{renderSidewayBar(Math.round((diskRead / 650) * 100), 8).text}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">WRITE:</span>
            <span className="text-cyan-400 font-bold">84 MB/s</span>
            <span className="text-cyan-400 font-mono">{renderSidewayBar(22, 8).text}</span>
          </div>
        </div>

        {/* Network Bandwidth */}
        <div className="p-2.5 rounded bg-stone-950 border border-stone-900 space-y-1.5">
          <div className="flex items-center justify-between border-b border-stone-900 pb-1">
            <span className="font-bold text-stone-300">NETWORK TRAFFIC</span>
            <span className="text-stone-500 text-[10px]">eth0 · 10 GbE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">RX IN:</span>
            <span className="text-emerald-400 font-bold">{netRx} Mb/s</span>
            <span className="text-emerald-400 font-mono">{renderSidewayBar(Math.round((netRx / 100) * 100), 8).text}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">TX OUT:</span>
            <span className="text-amber-400 font-bold">14.2 Mb/s</span>
            <span className="text-amber-400 font-mono">{renderSidewayBar(18, 8).text}</span>
          </div>
        </div>

        {/* GPU & VRAM */}
        <div className="p-2.5 rounded bg-stone-950 border border-stone-900 space-y-1.5">
          <div className="flex items-center justify-between border-b border-stone-900 pb-1">
            <span className="font-bold text-stone-300">GRAPHICS PIPELINE</span>
            <span className="text-emerald-400 text-[10px] font-bold">{gpuTemp}°C</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">GPU CORE:</span>
            <span className="text-emerald-400 font-bold">{gpuLoad}%</span>
            <span className="text-emerald-400 font-mono">{renderSidewayBar(gpuLoad, 8).text}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">VRAM:</span>
            <span className="text-cyan-400 font-bold">6.8 / 24 GB</span>
            <span className="text-cyan-400 font-mono">{renderSidewayBar(28, 8).text}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Daemon & Process Table */}
      <div className="flex-1 rounded bg-stone-950 border border-stone-900 flex flex-col overflow-hidden">
        {/* Table Column Headers */}
        <div className="bg-stone-900/90 text-stone-200 px-3 py-1 font-bold text-[11px] flex items-center border-b border-stone-800 shrink-0">
          <span className="w-14">PID</span>
          <span className="w-20">USER</span>
          <span className="w-12">STATE</span>
          <span className="w-10">PRI</span>
          <span className="w-16 text-right pr-2">CPU%</span>
          <span className="w-16 text-right pr-2">MEM%</span>
          <span className="w-18">DISK I/O</span>
          <span className="w-20">TIME+</span>
          <span className="flex-1">COMMAND (ENGINEERING DAEMONS)</span>
        </div>

        {/* Process Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-900/50 font-mono text-[11px] scrollbar-none">
          {processes.map((p) => (
            <div
              key={p.pid}
              className="flex items-center px-3 py-1 hover:bg-stone-900/60 transition-colors"
            >
              <span className="w-14 text-stone-400 font-bold">{p.pid}</span>
              <span className="w-20 text-stone-300">{p.user}</span>
              <span className="w-12">
                <span
                  className={`px-1 py-0.2 rounded text-[10px] font-bold ${
                    p.state === "R"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-stone-900 text-stone-400"
                  }`}
                >
                  {p.state === "R" ? "RUN" : "SLP"}
                </span>
              </span>
              <span className="w-10 text-stone-500">{p.pri}</span>
              <span className="w-16 text-right pr-2 font-bold text-emerald-400 dark:text-[#8dff55]">
                {p.cpu.toFixed(1)}%
              </span>
              <span className="w-16 text-right pr-2 text-stone-300">{p.mem.toFixed(1)}%</span>
              <span className="w-18 text-cyan-400">{p.ioRate}</span>
              <span className="w-20 text-stone-400">{p.time}</span>
              <span className="flex-1 truncate text-stone-100 font-semibold">{p.command}</span>
            </div>
          ))}
        </div>

        {/* Footer Hotkey Legend */}
        <div className="px-3 py-1 bg-stone-900/90 border-t border-stone-800 flex flex-wrap items-center justify-between text-[10px] text-stone-400 shrink-0">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-black border border-stone-700 text-stone-200 rounded font-bold">q</kbd> Quit to Prompt</span>
            <span><kbd className="px-1.5 py-0.5 bg-black border border-stone-700 text-stone-200 rounded font-bold">F1</kbd> Help</span>
            <span><kbd className="px-1.5 py-0.5 bg-black border border-stone-700 text-stone-200 rounded font-bold">F5</kbd> Tree View</span>
            <span><kbd className="px-1.5 py-0.5 bg-black border border-stone-700 text-stone-200 rounded font-bold">F9</kbd> Kill Daemon</span>
          </div>
          <span className="text-emerald-400/80 font-bold hidden sm:inline">TELEMETRY POLLING: 750ms</span>
        </div>
      </div>
    </div>
  );
}
