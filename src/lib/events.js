// Window events that connect independent pieces (popup, terminal, map, back button).
export const TERMINAL_OPEN = "terminal:open"; // open the terminal modal
export const TERMINAL_TRY = "terminal:try"; // popup "Try it now": focus + auto-type help
export const TERMINAL_FOCUS = "terminal:focus"; // focus the prompt (no auto-typing)
export const TERMINAL_NAVIGATED = "terminal:navigated"; // `cd` asks the page to scroll (detail = section id); the dock closes the modal first
export const LOCATION_REPLAY = "location:replay"; // replay the map fly-in

export const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

// Fun extras.
export const FUN_TOAST = "fun:toast"; // detail = message string
export const SITE_GLITCH = "fun:glitch"; // briefly glitch the page (fake `rm -rf /`)
export const toast = (message) => emit(FUN_TOAST, message);
