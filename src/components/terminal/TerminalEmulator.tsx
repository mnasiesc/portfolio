"use client";

import { useState, useRef, useEffect, useCallback, useSyncExternalStore, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import type { TerminalContext, TerminalOutput } from "@/lib/terminal/types";
import { parseCommand } from "@/lib/terminal/parser";
import { TerminalOutputView } from "./TerminalOutputView";
import { MatrixRain } from "./simulations/MatrixRain";
import { BusyStream } from "./simulations/BusyStream";
import { HtopMonitor } from "./simulations/HtopMonitor";

interface TerminalEntry {
  id: string;
  rawInput: string;
  output: TerminalOutput;
  timestamp: string;
}

interface TerminalEmulatorProps {
  context: TerminalContext;
}

function getInitialEntries(context: TerminalContext): TerminalEntry[] {
  return [
    {
      id: "initial-banner",
      rawInput: "system --boot",
      output: {
        type: "whoami",
        name: context.site.name,
        role: context.site.role,
        bio: context.home.heroDescription,
        availability: context.home.availability,
        issueLabel: context.site.issueLabel,
      },
      timestamp: "BOOT",
    },
    {
      id: "initial-help",
      rawInput: "help",
      output: parseCommand("help", context),
      timestamp: "BOOT",
    },
  ];
}

export function TerminalEmulator({ context }: TerminalEmulatorProps) {
  const router = useRouter();
  const [entries, setEntries] = useState<TerminalEntry[]>(() => getInitialEntries(context));
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draftInput, setDraftInput] = useState("");
  const [activeSimulation, setActiveSimulation] = useState<"busy" | "matrix" | "htop" | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const promptPrefix = `${context.terminal.promptUser}@${context.terminal.promptHost}:~$`;

  // Detect reduced-motion preference via useSyncExternalStore
  const prefersReducedMotion = useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return () => {};
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    },
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false),
    () => false,
  );

  const toggleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Global Escape and F11 listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        router.push(context.terminal.switchToVisualHref || "/");
      } else if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [context.terminal.switchToVisualHref, router, toggleFullscreen]);

  // Scroll to bottom when entries update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [entries, prefersReducedMotion]);

  // Auto-focus prompt input
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  const executeCommand = useCallback(
    (commandString: string) => {
      const trimmed = commandString.trim();

      if (!trimmed) {
        setEntries((prev) => [
          ...prev,
          {
            id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            rawInput: "",
            output: { type: "empty" },
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        setInputValue("");
        return;
      }

      // Update history buffer (ignore consecutive duplicates)
      setHistory((prev) => (prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed]));
      setHistoryIndex(-1);
      setDraftInput("");
      setInputValue("");

      // Special handling for 'clear'
      if (trimmed.toLowerCase() === "clear" || trimmed.toLowerCase() === "cls") {
        setEntries([]);
        return;
      }

      const output = parseCommand(trimmed, context);

      setEntries((prev) => [
        ...prev,
        {
          id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          rawInput: trimmed,
          output,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      // Route transitions for 'gui' and interactive simulations
      if (output.type === "gui") {
        setTimeout(() => {
          router.push(output.targetUrl);
        }, 200);
      } else if (output.type === "fullscreen") {
        toggleFullscreen();
      } else if (output.type === "interactive_mode") {
        setActiveSimulation(output.mode);
      }
    },
    [context, router, toggleFullscreen],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Escape to exit to visual mode
    if (e.key === "Escape") {
      e.preventDefault();
      router.push(context.terminal.switchToVisualHref || "/");
      return;
    }

    // F11 to toggle fullscreen
    if (e.key === "F11") {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

    // Enter to run command
    if (e.key === "Enter") {
      e.preventDefault();
      executeCommand(inputValue);
      return;
    }

    // Up Arrow for history navigation
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;

      if (historyIndex === -1) {
        setDraftInput(inputValue);
        const newIndex = history.length - 1;
        setHistoryIndex(newIndex);
        setInputValue(history[newIndex]);
      } else if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(history[newIndex]);
      }
      return;
    }

    // Down Arrow for history navigation
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;

      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputValue(history[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInputValue(draftInput);
      }
      return;
    }

    // Tab for command autocompletion
    if (e.key === "Tab") {
      e.preventDefault();
      const trimmed = inputValue.trim().toLowerCase();
      if (!trimmed) return;

      const candidates = [
        "help",
        "whoami",
        "projects",
        "project ",
        "writings",
        "writing ",
        "contact",
        "socials",
        "clear",
        "gui",
        "fullscreen",
        "misc",
        "busy",
        "matrix",
        "top",
      ];
      const match = candidates.find((c) => c.startsWith(trimmed));
      if (match) {
        setInputValue(match);
      }
      return;
    }

    // Ctrl+L to clear screen
    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setEntries([]);
      return;
    }

    // Ctrl+C to abort current input
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      setEntries((prev) => [
        ...prev,
        {
          id: `entry-${Date.now()}`,
          rawInput: `${inputValue}^C`,
          output: { type: "empty" },
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setInputValue("");
      setHistoryIndex(-1);
    }
  };

  return (
    <>
      {activeSimulation === "matrix" && (
        <MatrixRain
          onExit={() => {
            setActiveSimulation(null);
            setTimeout(focusInput, 50);
          }}
        />
      )}
      {activeSimulation === "busy" && (
        <BusyStream
          onExit={() => {
            setActiveSimulation(null);
            setTimeout(focusInput, 50);
          }}
        />
      )}
      {activeSimulation === "htop" && (
        <HtopMonitor
          onExit={() => {
            setActiveSimulation(null);
            setTimeout(focusInput, 50);
          }}
        />
      )}

      <div
        ref={containerRef}
        onClick={(e) => {
          // Prevent stealing focus if selecting text or clicking links/buttons
          const target = e.target as HTMLElement;
          if (target.tagName !== "A" && target.tagName !== "BUTTON") {
            focusInput();
          }
        }}
        className="terminal-screen w-full h-full flex-1 bg-black text-stone-100 font-mono flex flex-col p-3 sm:p-6 overflow-y-auto space-y-4 focus:outline-none scrollbar-none select-text"
      >
        {/* Welcome Banner */}
        <div className="terminal-banner space-y-1 pb-3 border-b border-stone-900 text-xs sm:text-sm text-stone-400">
          <div className="font-bold text-emerald-400 dark:text-[#8dff55] tracking-wide">
            TERMINAL SIMULATOR
          </div>
          <div className="text-stone-400 text-xs sm:text-sm">
            Type <span className="text-emerald-400 dark:text-[#8dff55] font-semibold">&apos;help&apos;</span> to inspect commands, <span className="text-emerald-400 dark:text-[#8dff55] font-semibold">&apos;misc&apos;</span> for simulations, or press <span className="text-stone-200 font-bold">[ESC]</span> / type <span className="text-emerald-400 dark:text-[#8dff55] font-semibold">&apos;gui&apos;</span> to return.
          </div>
        </div>

        {/* History Entries */}
        {entries.map((entry) => (
          <div key={entry.id} className="terminal-log-entry space-y-2">
            {entry.rawInput && (
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="text-emerald-500 dark:text-[#8dff55] font-bold select-none shrink-0">
                  {promptPrefix}
                </span>
                <span className="text-stone-100 font-bold break-all">
                  {entry.rawInput}
                </span>
                <span className="text-stone-600 text-[10px] ml-auto select-none shrink-0 hidden sm:inline">
                  {entry.timestamp}
                </span>
              </div>
            )}
            <div className="pl-0 sm:pl-3">
              <TerminalOutputView
                output={entry.output}
                onExecuteCommand={(cmd) => executeCommand(cmd)}
              />
            </div>
          </div>
        ))}

        {/* Active Command Prompt Line */}
        <div className="terminal-prompt-line flex items-center gap-2 pt-2">
          <label
            htmlFor="terminal-command-input"
            className="text-emerald-500 dark:text-[#8dff55] font-bold select-none shrink-0 text-xs sm:text-sm"
          >
            {promptPrefix}
          </label>
          <input
            id="terminal-command-input"
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 bg-transparent border-none outline-none text-stone-100 font-mono text-sm sm:text-base p-0 caret-emerald-400 dark:caret-[#8dff55] focus:ring-0 placeholder:text-stone-700"
            placeholder="type command... ('help', 'projects', 'writings', 'misc', or press ESC)"
          />
        </div>

        <div ref={bottomRef} className="h-4" />
      </div>
    </>
  );
}
