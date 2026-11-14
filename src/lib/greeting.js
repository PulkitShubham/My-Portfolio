/** Greeting based on the visitor's local time (their device clock, not mine). */
const slots = [
  { from: 5, hello: "Good morning", emoji: "☀️", line: "Coffee first, portfolio second." },
  { from: 12, hello: "Good afternoon", emoji: "🌤️", line: "Perfect time for a quick look around." },
  { from: 17, hello: "Good evening", emoji: "🌆", line: "Glad you dropped by." },
  { from: 21, hello: "Burning the midnight oil?", emoji: "🌙", line: "Same. Make yourself at home." },
  { from: 0, hello: "Still up?", emoji: "🦉", line: "Night owls are welcome here." },
];

export function getGreeting(date = new Date()) {
  const h = date.getHours();
  // Last slot whose start hour has passed; hours 0-4 fall to the "Still up?" slot.
  const slot = h < 5 ? slots[4] : [...slots.slice(0, 4)].reverse().find((s) => h >= s.from);
  return slot;
}
