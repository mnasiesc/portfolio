"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal as TerminalIcon, LayoutTemplate } from "lucide-react";

interface ViewSwitcherProps {
  terminalLabel: string;
  visualLabel: string;
}

export function ViewSwitcher({ terminalLabel, visualLabel }: ViewSwitcherProps) {
  const pathname = usePathname();
  const isTerminal = pathname === "/terminal";

  return (
    <Link
      href={isTerminal ? "/" : "/terminal"}
      className="station-view-switcher inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider transition-colors border border-stone-700/80 hover:border-emerald-500/80 bg-stone-900/60 text-stone-300 hover:text-emerald-300 dark:hover:text-[#8dff55] no-underline select-none"
      aria-label={isTerminal ? visualLabel : terminalLabel}
      title={isTerminal ? visualLabel : terminalLabel}
    >
      {isTerminal ? (
        <>
          <LayoutTemplate className="w-3.5 h-3.5 text-stone-400" />
          <span className="hidden sm:inline">{visualLabel}</span>
          <span className="sm:hidden">VISUAL</span>
        </>
      ) : (
        <>
          <TerminalIcon className="w-3.5 h-3.5 text-emerald-400 dark:text-[#8dff55]" />
          <span className="hidden sm:inline">{terminalLabel}</span>
          <span className="sm:hidden">&gt;_ CLI</span>
        </>
      )}
    </Link>
  );
}
