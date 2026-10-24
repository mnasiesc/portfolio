"use client";

import { useState, useRef, useEffect, useCallback, useSyncExternalStore, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TerminalContext, TerminalOutput } from "@/lib/terminal/types";
import { parseCommand } from "@/lib/terminal/parser";
import { TerminalOutputView } from "./TerminalOutputView";
import { TerminalQuickChips } from "./TerminalQuickChips";

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
        type: "about",
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
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );


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

      // Route transitions for 'home' and 'article'
      if (output.type === "home") {
        setTimeout(() => {
          router.push(output.targetUrl);
        }, 350);
      } else if (output.type === "article") {
        setTimeout(() => {
          router.push(output.localRoute);
        }, 400);
      }
    },
    [context, router],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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

    // Tab for basic command autocompletion
    if (e.key === "Tab") {
      e.preventDefault();
      const trimmed = inputValue.trim().toLowerCase();
      if (!trimmed) return;

      const candidates = [
        "help",
        "about",
        "projects",
        "project ",
        "writing",
        "article ",
        "contact",
        "socials",
        "clear",
        "home",
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
    <div
      ref={containerRef}
      onClick={(e) => {
        // Prevent stealing focus if selecting text or clicking links/buttons
        const target = e.target as HTMLElement;
        if (target.tagName !== "A" && target.tagName !== "BUTTON") {
          focusInput();
        }
      }}
      className="terminal-station-window w-full rounded-md border border-stone-800 bg-stone-950/95 text-stone-100 shadow-2xl overflow-hidden font-mono flex flex-col min-h-[580px] max-h-[85vh]"
    >
      {/* Terminal Title Bar / Station Rail */}
      <div className="terminal-header-rail flex items-center justify-between px-3 py-2 bg-stone-900 border-b border-stone-800 text-xs text-stone-400 select-none">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 dark:bg-[#8dff55]/90 inline-block animate-pulse" />
          <span className="font-bold text-stone-300">
            {context.terminal.promptUser}@{context.terminal.promptHost}
          </span>
          <span className="text-stone-600 hidden sm:inline">|</span>
          <span className="text-stone-500 text-[11px] hidden sm:inline">
            SYSTEM CONSOLE // {context.site.issueLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEntries([])}
            className="text-stone-500 hover:text-stone-300 text-[11px] uppercase tracking-wider hover:underline cursor-pointer"
          >
            clear buffer
          </button>
          <Link
            href={context.terminal.switchToVisualHref}
            className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-emerald-400 dark:text-[#8dff55] border border-stone-700 text-[11px] font-bold no-underline transition-colors"
          >
            {context.terminal.switchToVisualLabel} ↗
          </Link>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="terminal-screen flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 focus:outline-none scrollbar-thin scrollbar-thumb-stone-800">
        {/* Welcome Banner */}
        <div className="terminal-banner space-y-1 pb-2 border-b border-stone-800/80 text-xs sm:text-sm text-stone-400">
          {context.terminal.welcomeBanner.map((line, idx) => (
            <div key={idx} className="font-bold text-emerald-400 dark:text-[#8dff55]">
              {line}
            </div>
          ))}
          <div className="text-stone-500 text-xs pt-1">
            Type <span className="text-stone-300 font-semibold">&apos;help&apos;</span> for a list of commands, or click any quick action below.
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
            placeholder="type command... (e.g. 'help', 'projects', 'about')"
          />
        </div>

        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Touch-Friendly Quick Command Toolbar for Mobile & Convenience */}
      <div className="terminal-footer border-t border-stone-800 bg-stone-900/90 px-3 py-1.5">
        <TerminalQuickChips onSelectCommand={(cmd) => executeCommand(cmd)} />
      </div>
    </div>
  );
}
