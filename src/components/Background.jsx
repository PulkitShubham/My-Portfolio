/** Fixed ambient layer: drifting aurora blobs, a faded grid and film grain. */
export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-[10%] -top-[10%] h-[55vmax] w-[55vmax] animate-blob rounded-full bg-violet/25 blur-[120px]" />
      <div
        className="absolute -right-[15%] top-[20%] h-[45vmax] w-[45vmax] animate-blob rounded-full bg-cyan/15 blur-[120px]"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="absolute bottom-[-20%] left-[30%] h-[40vmax] w-[40vmax] animate-blob rounded-full bg-accent/10 blur-[120px]"
        style={{ animationDelay: "-14s" }}
      />

      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
        }}
      />

      <div className="noise absolute inset-0 opacity-[0.07] mix-blend-overlay" />
    </div>
  );
}
