"use client";

import { useEffect, useRef, useCallback } from "react";

interface MatrixRainProps {
  onExit: () => void;
}

export function MatrixRain({ onExit }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const chars =
      "0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ{}[];*&%$#@!<>~sys_kernel_epoll_inotify";
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));

    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 30 FPS retro cadence

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      // Translucent black overlay to produce phosphorescent fade trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head of drop is bright white/phosphor; tail is emerald
        if (Math.random() > 0.85) {
          ctx.fillStyle = "#ffffff";
        } else {
          ctx.fillStyle = "#8dff55";
        }

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-mono select-none overflow-hidden">
      {/* Top HUD */}
      <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between text-xs sm:text-sm bg-black/80 px-3 py-1.5 rounded border border-emerald-900/60 text-emerald-400 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">MATRIX DIGITAL RAIN [SIMULATION]</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-stone-400 text-xs hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-200">q</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-200">ESC</kbd>, or <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-200">Ctrl+C</kbd>
          </span>
          <button
            type="button"
            onClick={onExit}
            className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-xs font-bold cursor-pointer"
          >
            EXIT [q]
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
