// Window events that connect independent pieces (popup, terminal, map, back button).
export const TERMINAL_TRY = "terminal:try"; // popup "Try it now": focus + auto-type help
export const TERMINAL_FOCUS = "terminal:focus"; // focus the prompt (no auto-typing)
export const TERMINAL_NAVIGATED = "terminal:navigated"; // `cd` took the visitor elsewhere
export const LOCATION_REPLAY = "location:replay"; // replay the map fly-in

export const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
