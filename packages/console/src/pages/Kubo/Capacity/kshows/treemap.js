// Squarified treemap layout (Bruls, Huizing, van Wijk). Pure math, no DOM:
// the renderer behind app.js consumes plain rects, so a Canvas renderer can
// replace the SVG one later without touching this file.

/**
 * Lay out items inside (x, y, w, h). Items must have a positive `value`.
 * Returns [{x, y, w, h, item}] in the same order the algorithm placed them.
 */
export function squarify(items, x, y, w, h) {
  const total = items.reduce((s, it) => s + it.value, 0);
  if (total <= 0 || w <= 0 || h <= 0) return [];
  // Work on a copy sorted descending — squarify's quality guarantee needs it.
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const scale = (w * h) / total;
  const scaled = sorted.map((it) => ({ item: it, area: it.value * scale }));

  const rects = [];
  let rx = x, ry = y, rw = w, rh = h;
  let row = [];

  const layoutRow = (finalize) => {
    const rowArea = row.reduce((s, e) => s + e.area, 0);
    const horizontal = rw < rh; // row runs along the shorter side
    const side = horizontal ? rw : rh;
    const thickness = rowArea / side;
    let offset = 0;
    for (const e of row) {
      const len = e.area / thickness;
      rects.push(horizontal
        ? { x: rx + offset, y: ry, w: len, h: thickness, item: e.item }
        : { x: rx, y: ry + offset, w: thickness, h: len, item: e.item });
      offset += len;
    }
    if (horizontal) { ry += thickness; rh -= thickness; }
    else { rx += thickness; rw -= thickness; }
    row = [];
    if (finalize) return;
  };

  const worst = (candidate) => {
    const areas = candidate.map((e) => e.area);
    const sum = areas.reduce((s, a) => s + a, 0);
    const side = Math.min(rw, rh);
    const s2 = sum * sum;
    const max = Math.max(...areas);
    const min = Math.min(...areas);
    return Math.max((side * side * max) / s2, s2 / (side * side * min));
  };

  for (const e of scaled) {
    if (e.area <= 0) continue;
    if (row.length === 0) { row.push(e); continue; }
    if (worst([...row, e]) <= worst(row)) row.push(e);
    else { layoutRow(false); row = [e]; }
  }
  if (row.length) layoutRow(true);
  return rects;
}

/**
 * Split a rect into a "packed" region and a "free" region along its longer
 * side. freeFrac is the share of the area that is free. Returns
 * { packed: rect, free: rect | null }.
 */
export function splitFree(x, y, w, h, freeFrac) {
  if (freeFrac <= 0.005) return { packed: { x, y, w, h }, free: null };
  if (freeFrac >= 0.995) return { packed: null, free: { x, y, w, h } };
  if (w >= h) {
    const pw = w * (1 - freeFrac);
    return {
      packed: { x, y, w: pw, h },
      free: { x: x + pw, y, w: w - pw, h },
    };
  }
  const ph = h * (1 - freeFrac);
  return {
    packed: { x, y, w, h: ph },
    free: { x, y: y + ph, w, h: h - ph },
  };
}
