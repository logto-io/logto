declare interface Window {
  // `gtag.js`
  gtag?: (...args: unknown[]) => void;
  // Reddit
  rdt?: (...args: unknown[]) => void;
  // Plausible
  plausible?: (...args: unknown[]) => void;
}
