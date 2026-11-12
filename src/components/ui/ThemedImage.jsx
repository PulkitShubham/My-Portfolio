/**
 * Renders the right asset for the active theme. Both images are in the DOM and
 * CSS picks one, so switching themes is instant and there's no flash on load.
 * `src` is either a string (same in both themes) or { onDark, onLight }.
 */
export default function ThemedImage({ src, alt = "", className = "" }) {
  if (typeof src === "string") return <img src={src} alt={alt} className={className} />;
  return (
    <>
      <img src={src.onDark} alt={alt} className={`light:hidden ${className}`} />
      {/* Duplicate is decorative: hidden from screen readers so the name isn't read twice */}
      <img src={src.onLight} alt="" aria-hidden className={`hidden light:block ${className}`} />
    </>
  );
}
