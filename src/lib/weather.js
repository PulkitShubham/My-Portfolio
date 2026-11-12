// Live weather for the Location section and the terminal's `weather` command.
// Open-Meteo: free, no API key, CORS-enabled. Only fixed coordinates are sent (no visitor data).
import { place } from "../data/content";

const TTL = 10 * 60 * 1000; // re-use a result for 10 minutes
let cache = null; // { at, promise }

// WMO weather codes -> label + emoji (day/night aware where it matters).
const CODES = [
  [[0], "Clear sky", "☀️", "🌙"],
  [[1, 2], "Partly cloudy", "🌤️", "☁️"],
  [[3], "Overcast", "☁️", "☁️"],
  [[45, 48], "Foggy", "🌫️", "🌫️"],
  [[51, 53, 55, 56, 57], "Drizzle", "🌦️", "🌧️"],
  [[61, 63, 65, 66, 67, 80, 81, 82], "Rain", "🌧️", "🌧️"],
  [[71, 73, 75, 77, 85, 86], "Snow (in Bengaluru?!)", "❄️", "❄️"],
  [[95, 96, 99], "Thunderstorm", "⛈️", "⛈️"],
];

export function describe(code, isDay = true) {
  const hit = CODES.find(([codes]) => codes.includes(code));
  if (!hit) return { label: "Unknown", emoji: "🌡️" };
  return { label: hit[1], emoji: isDay ? hit[2] : hit[3] };
}

/** Resolves to { temp, feels, humidity, wind, code, isDay, label, emoji } or rejects. */
export function getWeather() {
  if (cache && Date.now() - cache.at < TTL) return cache.promise;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lng}` +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day,wind_speed_10m" +
    `&timezone=${encodeURIComponent(place.timezone)}`;

  // One attempt with an 8s timeout; retried once after a short pause to ride out blips.
  const attempt = () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    return fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`weather HTTP ${r.status}`);
        return r.json();
      })
      .finally(() => clearTimeout(timer));
  };
  const promise = attempt()
    .catch(() => new Promise((r) => setTimeout(r, 1500)).then(attempt))
    .then(({ current: c }) => ({
      temp: Math.round(c.temperature_2m),
      feels: Math.round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      wind: Math.round(c.wind_speed_10m),
      code: c.weather_code,
      isDay: c.is_day === 1,
      ...describe(c.weather_code, c.is_day === 1),
    }))
    .catch((e) => {
      cache = null; // don't cache failures
      throw e;
    });

  cache = { at: Date.now(), promise };
  return promise;
}

/** "02:15 AM" in Bengaluru, regardless of the visitor's timezone. */
export const bengaluruTime = (opts = {}) =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: place.timezone, ...opts });
