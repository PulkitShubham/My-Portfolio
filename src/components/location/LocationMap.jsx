import { useEffect, useRef, useState } from "react";
import { FiMapPin, FiRotateCcw } from "react-icons/fi";
import { place } from "../../data/content";
import { LOCATION_REPLAY } from "../../lib/events";

const WORLD = { center: [20, 15], zoom: 2 };
const INDIA = { center: [22.5, 80], zoom: 4.5 };
const CITY_ZOOM = 11; // whole number: tile servers only have integer zoom levels

// OpenStreetMap standard tiles: free, no API key; attribution required (shown bottom-right).
// Dark mode re-colours the same tiles with a CSS filter (see .map-tiles in index.css),
// so switching theme never reloads tiles.
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = () => window.matchMedia("(pointer: coarse)").matches;

/**
 * Leaflet map that flies World -> India -> Bengaluru and drops a pin.
 * Leaflet (+ CSS) is loaded lazily, only when the section approaches the viewport.
 */
export default function LocationMap() {
  const wrapRef = useRef(null);
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const LRef = useRef(null);
  const markerRef = useRef(null);
  const runRef = useRef(0); // increments to cancel an in-flight sequence
  const playedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(WORLD.zoom);
  const [failed, setFailed] = useState(false);

  /* ----- lazy-load Leaflet when we're ~800px away ----- */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let disposed = false;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting || mapRef.current) return;
        io.disconnect();
        try {
          const [{ default: L }] = await Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]);
          if (disposed || !mapElRef.current) return;
          LRef.current = L;
          const map = L.map(mapElRef.current, {
            zoomControl: false,
            scrollWheelZoom: false, // never hijack page scrolling
            dragging: !isTouch(), // on phones, one finger scrolls the page
            tap: false,
            zoomSnap: 0.25,
            worldCopyJump: true,
            attributionControl: true,
          }).setView(WORLD.center, WORLD.zoom);
          L.control.zoom({ position: "bottomright" }).addTo(map);
          map.attributionControl.setPrefix(false);
          L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19, className: "map-tiles" }).addTo(map);
          map.on("zoom", () => setZoom(map.getZoom()));
          mapRef.current = map;
          setReady(true);
        } catch {
          if (!disposed) setFailed(true);
        }
      },
      { rootMargin: "800px 0px" }
    );
    io.observe(el);
    return () => {
      disposed = true;
      io.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  /* ----- the fly-in ----- */
  const dropPin = () => {
    const L = LRef.current;
    const map = mapRef.current;
    markerRef.current?.remove();
    const icon = L.divIcon({
      className: "map-pin-root",
      html: '<span class="map-pin"><span class="map-pin-ring"></span><span class="map-pin-ring map-pin-ring--late"></span><span class="map-pin-head"></span></span>',
      iconSize: [28, 40],
      iconAnchor: [14, 38],
    });
    markerRef.current = L.marker([place.lat, place.lng], { icon, keyboard: false, title: place.nickname })
      .addTo(map)
      .bindTooltip(place.nickname, { permanent: true, direction: "top", offset: [0, -40], className: "map-pin-label" });
  };

  const play = () => {
    const map = mapRef.current;
    if (!map) return;
    const run = ++runRef.current;
    markerRef.current?.remove();
    map.stop();

    if (prefersReducedMotion()) {
      map.setView([place.lat, place.lng], CITY_ZOOM, { animate: false });
      dropPin();
      return;
    }
    const step = (target, zoomLevel, duration) =>
      new Promise((resolve) => {
        if (run !== runRef.current) return; // cancelled
        map.once("moveend", resolve);
        map.flyTo(target, zoomLevel, { duration, easeLinearity: 0.2 });
      });

    map.setView(WORLD.center, WORLD.zoom, { animate: false });
    (async () => {
      await new Promise((r) => setTimeout(r, 300));
      await step(INDIA.center, INDIA.zoom, 1.8);
      await new Promise((r) => setTimeout(r, 250));
      await step([place.lat, place.lng], CITY_ZOOM, 2.4);
      if (run === runRef.current) dropPin();
    })();
  };

  // First play when at least half the map is visible.
  useEffect(() => {
    if (!ready) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !playedRef.current) {
          playedRef.current = true;
          play();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(wrapRef.current);
    const onReplay = () => {
      playedRef.current = true;
      // Give the page scroll a moment when replay comes from the terminal.
      setTimeout(play, 700);
    };
    window.addEventListener(LOCATION_REPLAY, onReplay);
    return () => {
      io.disconnect();
      window.removeEventListener(LOCATION_REPLAY, onReplay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const coords = `${place.lat.toFixed(4)}° N, ${place.lng.toFixed(4)}° E`;

  return (
    <div ref={wrapRef} className="relative h-[22rem] overflow-hidden rounded-3xl border border-line bg-surface md:h-[30rem]">
      <div
        ref={mapElRef}
        className="absolute inset-0 z-0"
        role="img"
        aria-label={`Map zooming into ${place.city}, ${place.region}`}
      />

      {/* Loading / failure state */}
      {!ready && (
        <div className="absolute inset-0 grid place-items-center">
          {failed ? (
            <p className="px-6 text-center text-sm text-muted">
              Map couldn't load. I'm based in <span className="text-fg">{place.city}, {place.region}</span>.
            </p>
          ) : (
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted animate-pulse">locating…</span>
          )}
        </div>
      )}

      {/* Edge vignette so overlays stay readable on any tile */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[401] shadow-[inset_0_0_80px_20px_var(--color-ink)] opacity-70" />

      {/* Overlays (z above Leaflet panes, which top out at ~400 for markers) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start justify-between gap-3 p-4">
        <span className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
          <FiMapPin className="text-accent-fg" />
          {place.city}, {place.region}
        </span>
        <button
          type="button"
          onClick={() => play()}
          disabled={!ready}
          className="glass pointer-events-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs transition-colors hover:text-accent-fg disabled:opacity-50"
        >
          <FiRotateCcw /> Replay
        </button>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 z-[500] p-4">
        <div className="glass rounded-xl px-3 py-2 font-mono text-[11px] leading-relaxed text-fg/80">
          <div>{coords}</div>
          <div className="text-muted">zoom {zoom.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
