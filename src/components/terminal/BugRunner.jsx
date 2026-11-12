import { useEffect, useRef, useState } from "react";

/**
 * Chrome-dino-style runner: jump the bugs, clear `target` of them to win.
 * Space / ↑ / W / tap to jump · Esc to quit. Uses delta-time physics so it
 * plays the same on 60 Hz and 120 Hz screens.
 */
export const GAME_START = "terminal:game-start"; // tells older game instances to stop
const BEST_KEY = "terminal-game-best";
const H = 170;
const GROUND = H - 28;
const COLORS = { bg: "#0b0b10", fg: "#d7d7de", muted: "#4b4b57", lime: "#c8ff3d", red: "#f87171", cyan: "#22d3ee" };

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};
const writeBest = (n) => {
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {
    /* ignore */
  }
};

export default function BugRunner({ target = 10, onWin, onExit }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("ready"); // for screen readers + the hint line
  const [cleared, setCleared] = useState(0);
  const idRef = useRef(Math.random());
  const onWinRef = useRef(onWin);
  const onExitRef = useRef(onExit);
  onWinRef.current = onWin;
  onExitRef.current = onExit;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const myId = idRef.current;
    let W = 600;
    let raf = 0;
    let last = 0;
    let alive = true;

    const s = {
      phase: "ready", // ready | run | over | won
      y: GROUND,
      vy: 0,
      bugs: [],
      spawnIn: 900,
      speed: 0.3, // px/ms
      cleared: 0,
      best: readBest(),
      t: 0,
      won: false,
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.parentElement.clientWidth;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    const reset = () => {
      Object.assign(s, { phase: "run", y: GROUND, vy: 0, bugs: [], spawnIn: 700, speed: 0.3, cleared: 0, t: 0 });
      setCleared(0);
      setStatus("run");
    };
    const jump = () => {
      if (s.phase === "ready" || s.phase === "over") return reset();
      if (s.phase === "won") return;
      if (s.y >= GROUND - 0.5) s.vy = -0.62;
    };

    const onKey = (e) => {
      if (e.key === " " || e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        e.preventDefault();
        jump();
      } else if (e.key === "Escape") {
        e.preventDefault();
        stop();
        onExitRef.current?.();
      }
    };
    const onPointer = (e) => {
      e.preventDefault();
      canvas.focus({ preventScroll: true });
      jump();
    };
    canvas.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", onPointer);

    // A newer game instance starting stops this one.
    const onOtherStart = (e) => e.detail !== myId && stop();
    window.addEventListener(GAME_START, onOtherStart);
    window.dispatchEvent(new CustomEvent(GAME_START, { detail: myId }));

    const onVisibility = () => {
      if (document.hidden && s.phase === "run") {
        s.phase = "over"; // treat tab-switch as a pause/loss rather than an unfair death
        setStatus("paused");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    function stop() {
      alive = false;
      cancelAnimationFrame(raf);
    }

    /* ----- drawing ----- */
    const drawBot = (x, y) => {
      // little lime robot: body, visor, antenna, legs that patter while running
      ctx.fillStyle = COLORS.lime;
      ctx.fillRect(x, y - 24, 22, 18);
      ctx.fillRect(x + 9, y - 30, 4, 6);
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(x + 4, y - 20, 14, 6);
      ctx.fillStyle = COLORS.cyan;
      ctx.fillRect(x + 12, y - 19, 4, 4);
      ctx.fillStyle = COLORS.lime;
      const step = s.phase === "run" && y >= GROUND - 0.5 ? Math.floor(s.t / 90) % 2 : 0;
      ctx.fillRect(x + 3, y - 6, 5, step ? 6 : 4);
      ctx.fillRect(x + 14, y - 6, 5, step ? 4 : 6);
    };
    const drawBug = (b) => {
      const { x, w, h } = b;
      const y = GROUND;
      ctx.fillStyle = COLORS.red;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y - h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.bg;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y - h);
      ctx.lineTo(x + w / 2, y);
      ctx.stroke();
      ctx.strokeStyle = COLORS.red;
      ctx.beginPath(); // legs + antennae
      for (let i = 0; i < 3; i++) {
        const lx = x + 3 + i * ((w - 6) / 2);
        ctx.moveTo(lx, y - 2);
        ctx.lineTo(lx - 3, y + 2);
      }
      ctx.moveTo(x + w * 0.3, y - h);
      ctx.lineTo(x + w * 0.2, y - h - 5);
      ctx.moveTo(x + w * 0.7, y - h);
      ctx.lineTo(x + w * 0.8, y - h - 5);
      ctx.stroke();
    };

    const text = (str, x, y, { color = COLORS.fg, size = 12, align = "left", weight = "500" } = {}) => {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${size}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textAlign = align;
      ctx.fillText(str, x, y);
    };

    const draw = () => {
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, W, H);
      // stars (parallax)
      ctx.fillStyle = COLORS.muted;
      for (let i = 0; i < 28; i++) {
        const sx = (((i * 97) % W) - ((s.t * s.speed * 0.15) % W) + W) % W;
        ctx.fillRect(sx, 18 + ((i * 53) % (GROUND - 50)), 1.5, 1.5);
      }
      // ground with moving dashes
      ctx.fillStyle = COLORS.muted;
      ctx.fillRect(0, GROUND + 1, W, 1);
      for (let i = 0; i < W / 24 + 2; i++) {
        const gx = ((i * 24 - ((s.t * s.speed) % 24)) + W) % (W + 24) - 12;
        ctx.fillRect(gx, GROUND + 7 + (i % 3) * 3, 8, 1);
      }
      s.bugs.forEach(drawBug);
      drawBot(36, s.y);

      // HUD
      text(`BUGS ${String(s.cleared).padStart(2, "0")}/${target}`, W - 12, 20, { align: "right", color: COLORS.lime, weight: "600" });
      text(`BEST ${String(s.best).padStart(2, "0")}`, W - 12, 36, { align: "right", color: COLORS.muted });

      if (s.phase === "ready") {
        text("BUG RUNNER", W / 2, 62, { align: "center", size: 18, weight: "700", color: COLORS.lime });
        text(`jump ${target} bugs to unlock the command guide`, W / 2, 84, { align: "center", color: COLORS.fg });
        text("SPACE / ↑ / TAP to start · ESC to quit", W / 2, 104, { align: "center", color: COLORS.muted, size: 11 });
      } else if (s.phase === "over") {
        text("SEGFAULT 💥", W / 2, 66, { align: "center", size: 18, weight: "700", color: COLORS.red });
        text(`squashed ${s.cleared} · press SPACE or tap to retry`, W / 2, 90, { align: "center" });
      } else if (s.phase === "won") {
        text("✓ ALL BUGS CLEARED", W / 2, 66, { align: "center", size: 18, weight: "700", color: COLORS.lime });
        text("command guide unlocked ↓", W / 2, 90, { align: "center" });
      }
    };

    /* ----- simulation ----- */
    const tick = (now) => {
      if (!alive) return;
      const dt = Math.min(34, last ? now - last : 16); // clamp big gaps (tab switch, jank)
      last = now;

      if (s.phase === "run") {
        s.t += dt;
        s.vy += 0.0021 * dt;
        s.y = Math.min(GROUND, s.y + s.vy * dt);
        if (s.y >= GROUND) s.vy = 0;

        s.spawnIn -= dt;
        if (s.spawnIn <= 0) {
          const w = 16 + Math.random() * 10;
          s.bugs.push({ x: W + 10, w, h: 14 + Math.random() * 8, passed: false });
          // Occasionally a pair of bugs close together.
          if (s.cleared > 3 && Math.random() < 0.25) s.bugs.push({ x: W + 10 + w + 6, w: 14, h: 14, passed: false });
          s.spawnIn = 650 + Math.random() * 700 - s.speed * 400;
        }
        for (const b of s.bugs) {
          b.x -= s.speed * dt;
          // collision (slightly forgiving hitboxes)
          const bx = 36 + 3, by = s.y - 24, bw = 16, bh = 22;
          if (bx < b.x + b.w - 3 && bx + bw > b.x + 3 && by + bh > GROUND - b.h + 3) {
            s.phase = "over";
            if (s.cleared > s.best) {
              s.best = s.cleared;
              writeBest(s.best);
            }
            setStatus("over");
          }
          if (!b.passed && b.x + b.w < 36) {
            b.passed = true;
            s.cleared++;
            s.speed = Math.min(0.55, 0.3 + s.cleared * 0.018);
            setCleared(s.cleared);
            if (s.cleared >= target && !s.won) {
              s.won = true;
              s.phase = "won";
              if (s.cleared > s.best) {
                s.best = s.cleared;
                writeBest(s.best);
              }
              setStatus("won");
              setTimeout(() => onWinRef.current?.(), 600);
            }
          }
        }
        s.bugs = s.bugs.filter((b) => b.x + b.w > -20);
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    canvas.focus({ preventScroll: true });

    return () => {
      stop();
      ro.disconnect();
      canvas.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onPointer);
      window.removeEventListener(GAME_START, onOtherStart);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [target]);

  const live =
    status === "ready" ? "Game ready. Press space or tap to start."
    : status === "run" ? `Bugs cleared: ${cleared} of ${target}.`
    : status === "won" ? "You won. Command guide unlocked."
    : status === "paused" ? "Game paused. Press space to restart."
    : `Game over with ${cleared} bugs cleared. Press space to retry.`;

  return (
    <div className="my-1">
      <div className="overflow-hidden rounded-lg border border-white/10">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Bug Runner game. Space, up arrow, W or tap to jump. Escape to quit."
          className="block w-full cursor-pointer touch-none outline-none focus-visible:ring-2 focus-visible:ring-[#c8ff3d]/60"
        />
      </div>
      <p className="sr-only" aria-live="polite">{live}</p>
      <p className="mt-1 text-[#7c7c8a]">
        {status === "won" ? "🎉 nice jumping." : "space / ↑ / tap to jump · esc returns to the prompt"}
      </p>
    </div>
  );
}
