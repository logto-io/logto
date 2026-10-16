// Human-readable formatting for the two units this tool speaks: millicores
// and bytes. Everything else in the UI is a percentage.

export function fmtCPU(millis) {
  if (millis == null) return "—";
  if (millis < 1000) return `${Math.round(millis)}m`;
  const cores = millis / 1000;
  return `${cores >= 10 ? Math.round(cores) : cores.toFixed(1)} cores`;
}

const BYTE_STEPS = [
  [1 << 30, "GiB"],
  [1 << 20, "MiB"],
  [1 << 10, "KiB"],
];

export function fmtBytes(bytes) {
  if (bytes == null) return "—";
  for (const [unit, label] of BYTE_STEPS) {
    if (bytes >= unit) {
      const v = bytes / unit;
      return `${v >= 100 ? Math.round(v) : v.toFixed(1)} ${label}`;
    }
  }
  return `${bytes} B`;
}

// Cost is list price per hour, so the unit stays with the number.
export function fmtUSD(perHour) {
  if (perHour == null) return "—";
  if (perHour === 0) return "$0/h";
  const digits = perHour < 1 ? 3 : 2;
  return `$${perHour.toFixed(digits)}/h`;
}

export function fmtValue(dimension, value) {
  if (dimension === "cost") return fmtUSD(value);
  return dimension === "cpu" ? fmtCPU(value) : fmtBytes(value);
}

export function fmtPct(frac) {
  if (!isFinite(frac)) return "—";
  return `${Math.round(frac * 100)}%`;
}

export function fmtClock(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
