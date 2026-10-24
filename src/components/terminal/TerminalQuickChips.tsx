interface TerminalQuickChipsProps {
  onSelectCommand: (command: string) => void;
}

const CHIPS = [
  { label: "help", command: "help" },
  { label: "about", command: "about" },
  { label: "projects", command: "projects" },
  { label: "writing", command: "writing" },
  { label: "contact", command: "contact" },
  { label: "socials", command: "socials" },
  { label: "clear", command: "clear" },
  { label: "home (exit)", command: "home" },
];

export function TerminalQuickChips({ onSelectCommand }: TerminalQuickChipsProps) {
  return (
    <div
      className="terminal-quick-chips flex items-center gap-1.5 overflow-x-auto py-2 px-1 text-xs font-mono scrollbar-none"
      role="toolbar"
      aria-label="Quick terminal commands"
    >
      <span className="text-[10px] text-stone-500 uppercase tracking-wider select-none shrink-0 pr-1">
        QUICK:
      </span>
      {CHIPS.map((chip) => (
        <button
          key={chip.command}
          type="button"
          onClick={() => onSelectCommand(chip.command)}
          className="shrink-0 px-2.5 py-1 rounded border border-stone-800 bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-emerald-300 dark:hover:text-[#8dff55] hover:border-stone-700 transition-colors cursor-pointer text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
