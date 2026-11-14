/**
 * Fixed ambient layer: drifting aurora blobs, a faded grid and film grain.
 * Blobs are soft radial gradients instead of blurred divs: a 120px CSS blur on
 * a viewport-sized layer is very costly on phone GPUs, the gradient looks the
 * same and animates on the compositor only.
 */
const blob = (color) => ({
  background: `radial-gradient(closest-side, color-mix(in oklab, var(${color}) 100%, transparent), transparent)`,
});

export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-[10%] -top-[10%] h-[70vmax] w-[70vmax] animate-blob rounded-full opacity-25 will-change-transform"
        style={blob("--color-violet")}
      />
      <div
        className="absolute -right-[15%] top-[20%] h-[60vmax] w-[60vmax] animate-blob rounded-full opacity-15 will-change-transform"
        style={{ ...blob("--color-cyan"), animationDelay: "-7s" }}
      />
      <div
        className="absolute bottom-[-20%] left-[30%] h-[50vmax] w-[50vmax] animate-blob rounded-full opacity-10 will-change-transform"
        style={{ ...blob("--color-accent"), animationDelay: "-14s" }}
      />

      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--color-fg) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-fg) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
        }}
      />

      {/* Film grain with a blend mode forces a full-screen re-composite; desktop only. */}
      <div className="noise absolute inset-0 opacity-[0.07] mix-blend-overlay max-md:hidden" />
    </div>
  );
}
