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
      className="station-view-switcher no-underline select-none"
      aria-label={isTerminal ? visualLabel : terminalLabel}
      title={isTerminal ? visualLabel : terminalLabel}
    >
      {isTerminal ? (
        <>
          <LayoutTemplate className="w-3.5 h-3.5 terminal-icon" />
          <span className="hidden sm:inline">{visualLabel}</span>
          <span className="sm:hidden">VISUAL</span>
        </>
      ) : (
        <>
          <TerminalIcon className="w-3.5 h-3.5 terminal-icon" />
          <span className="hidden sm:inline">{terminalLabel}</span>
          <span className="sm:hidden">&gt;_ CLI</span>
        </>
      )}
    </Link>
  );
}
