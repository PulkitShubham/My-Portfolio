import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FiClock, FiCloud, FiCompass } from "react-icons/fi";
import { place } from "../../data/content";
import { bengaluruTime, getWeather } from "../../lib/weather";
import SectionHeading from "../ui/SectionHeading";
import SpotlightCard from "../ui/SpotlightCard";
import LocationMap from "./LocationMap";

const ease = [0.22, 1, 0.36, 1];

/** Visitor's offset from IST, e.g. "IST is 4h 30m ahead of you". Computed locally; nothing is sent anywhere. */
function offsetFromVisitor() {
  const visitorMin = -new Date().getTimezoneOffset();
  const diff = 330 - visitorMin; // IST = UTC+5:30 = 330 min
  if (diff === 0) return "Same time zone as you";
  const h = Math.floor(Math.abs(diff) / 60);
  const m = Math.abs(diff) % 60;
  return `IST is ${h}h${m ? ` ${m}m` : ""} ${diff > 0 ? "ahead of" : "behind"} you`;
}

function Clock() {
  const [now, setNow] = useState(() => bengaluruTime({ second: "2-digit" }));
  useEffect(() => {
    const id = setInterval(() => setNow(bengaluruTime({ second: "2-digit" })), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{now}</span>;
}

function Weather() {
  const [state, setState] = useState({ status: "loading" });
  useEffect(() => {
    let alive = true;
    getWeather()
      .then((w) => alive && setState({ status: "ok", w }))
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, []);

  if (state.status === "loading")
    return <div className="h-14 w-40 animate-pulse rounded-xl bg-fg/[0.06]" aria-label="Loading weather" />;
  if (state.status === "error") return <p className="text-sm text-muted">Weather is taking a break. Probably stuck at Silk Board.</p>;
  const { w } = state;
  return (
    <div>
      <p className="flex items-center gap-3 font-display text-4xl font-bold tracking-tight">
        <span aria-hidden>{w.emoji}</span>
        {w.temp}°C
      </p>
      <p className="mt-1 text-sm text-muted">
        {w.label} · feels {w.feels}° · {w.humidity}% humidity · wind {w.wind} km/h
      </p>
    </div>
  );
}

const card = (i) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, delay: i * 0.08, ease },
});

export default function LocationSection() {
  return (
    <section id="location" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeading
          index="07"
          label="Location"
          title={`Based in ${place.nickname}.`}
          desc="Building software from India's tech capital. Here's where to find me, what time it is, and how the weather's treating us."
        />

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <motion.div {...card(0)}>
            <LocationMap />
          </motion.div>

          <div className="grid gap-4">
            <SpotlightCard {...card(1)} className="p-6">
              <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                <FiClock className="text-accent-fg" /> Local time
              </p>
              <p className="font-display text-4xl font-bold tracking-tight">
                <Clock />
              </p>
              <p className="mt-1 text-sm text-muted">
                {place.tzLabel} · {offsetFromVisitor()}
              </p>
            </SpotlightCard>

            <SpotlightCard {...card(2)} className="p-6">
              <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                <FiCloud className="text-accent-fg" /> Weather right now
              </p>
              <Weather />
            </SpotlightCard>

            <SpotlightCard {...card(3)} className="p-6">
              <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                <FiCompass className="text-accent-fg" /> Good to know
              </p>
              <p className="text-sm leading-relaxed">{place.fact}</p>
              <p className="mt-2 font-mono text-xs text-muted">{place.elevation}</p>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
