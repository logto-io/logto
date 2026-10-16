// kshows UI. Layout math lives in treemap.js; this file owns state, the SVG
// renderer, and interactions. Tiles are keyed by pod UID so SSE updates
// animate blocks instead of repainting them.

import { squarify, splitFree } from "./treemap.js";
import { fmtCPU, fmtBytes, fmtUSD, fmtValue, fmtPct, fmtClock } from "./format.js";

const SVG = "http://www.w3.org/2000/svg";

const NS_COLORS = [
  "var(--ns-1)", "var(--ns-2)", "var(--ns-3)", "var(--ns-4)",
  "var(--ns-5)", "var(--ns-6)", "var(--ns-7)", "var(--ns-8)",
];
const OTHER = "var(--ns-other)";
const NODE_H = 300; // treemap height per node card, px
const MAX_TILES = 40; // beyond this, small pods fold into one "+N more" tile

// View state: URL params (shareable links) win over the sticky localStorage
// choice. ?dim=cpu|mem|disk|cost &metric=requests|limits|actual &node=<name>
const params = new URLSearchParams(location.search);
const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

const state = {
  snapshot: null,
  dimension: pick(params.get("dim") || localStorage.getItem("kshows.dimension"),
    ["cpu", "mem", "disk", "cost"], "cpu"),
  metric: pick(params.get("metric") || localStorage.getItem("kshows.metric"),
    ["requests", "limits", "actual"], "actual"),
  drill: params.get("node") || null,
  lastEventAt: 0,
};

const nsSlots = new Map(); // namespace -> slot index, first-seen, session-stable
const podIndex = new Map(); // "node￿uid" -> pod (for tooltips)
const cards = new Map();    // node name -> { card, svg, els }
let renderedMode = "";      // `${dimension}|${metric}` — mode switch = full rebuild
let hatchSeq = 0;

const $ = (sel) => document.querySelector(sel);

// Cluster-supplied strings (pod/node/namespace names, role labels) are
// interpolated into innerHTML sinks — escape them, even though today's
// DNS-1123 validation makes them tame.
const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

function nsColor(ns) {
  if (ns === "__more") return OTHER;
  if (!nsSlots.has(ns)) nsSlots.set(ns, nsSlots.size);
  const slot = nsSlots.get(ns);
  return slot < NS_COLORS.length ? NS_COLORS[slot] : OTHER;
}

// Black or white, whichever has the higher WCAG contrast against a fill.
// Fills are fixed namespace colors, so the choice does not depend on theme.
function labelInk(color) {
  const ref = /var\((--[^)]+)\)/.exec(color);
  const hex = ref ? getComputedStyle(document.documentElement).getPropertyValue(ref[1]).trim() : color;
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#ffffff";
  const lin = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  const onWhite = 1.05 / (lum + 0.05);
  const onInk = (lum + 0.05) / (0.0055 + 0.05); // #0b0f16 luminance ≈ 0.0055
  return onWhite >= onInk ? "#ffffff" : "#0b0f16";
}

// ---------- value accessors ----------

const dimKey = (dim) => (dim === "cpu" ? "cpuMillis" : "memBytes");

// Raw CPU or memory value of one pod for a metric. Actual is never below the
// reservation: an unreserved pod still occupies what it uses.
function rawValue(pod, k, metric) {
  if (metric === "requests") return pod.requests[k];
  if (metric === "limits") return pod.limits[k];
  return Math.max(pod.requests[k], pod.hasUsage ? pod.usage[k] : 0);
}

function podValue(pod, dim, metric) {
  if (dim === "cost") return pod.cost?.[metric] ?? 0;
  return rawValue(pod, dimKey(dim), metric);
}

function nodeAlloc(node, dim) {
  if (dim === "cost") return node.hourlyUSD || 0;
  return dim === "cpu" ? node.allocatable.cpuMillis : node.allocatable.memBytes;
}

// A pod's list price per hour is its node's rate, split by how much of the
// node's CPU and memory the pod takes (the mean of the two shares).
function annotateCosts(node) {
  const a = node.allocatable;
  const share = (v, cap) => (cap > 0 ? v / cap : 0);
  for (const p of node.pods) {
    p.cost = {};
    for (const metric of ["requests", "limits", "actual"]) {
      const frac = (share(rawValue(p, "cpuMillis", metric), a.cpuMillis) +
        share(rawValue(p, "memBytes", metric), a.memBytes)) / 2;
      p.cost[metric] = (node.hourlyUSD || 0) * frac;
    }
  }
}

// ---------- data plumbing ----------

async function bootstrap() {
  // Live updates over Server-Sent Events; the browser reconnects on its own.
  // A poll of the snapshot covers any gap while the stream is down.
  const poll = async () => {
    try {
      apply(await window.kshowsSnapshot());
    } catch { /* keep the last snapshot */ }
    updateStatus();
  };
  await poll().catch(() => {});
  if ("EventSource" in window && window.kshowsStreamUrl) {
    const es = new EventSource(window.kshowsStreamUrl);
    es.addEventListener("snapshot", (e) => apply(JSON.parse(e.data)));
    es.onerror = () => updateStatus();
  }
  setInterval(() => {
    updateStatus();
    if (Date.now() - state.lastEventAt > 45000) poll();
  }, 10000);
}

function apply(snapshot) {
  for (const n of snapshot.nodes) annotateCosts(n);
  state.snapshot = snapshot;
  state.lastEventAt = Date.now();

  // Seed namespace colors ordered by total requested CPU, so the biggest
  // tenants get the leading palette slots. First-seen order is kept forever
  // after that — color follows the namespace, not its current rank.
  const totals = new Map();
  for (const n of snapshot.nodes)
    for (const p of n.pods)
      totals.set(p.namespace, (totals.get(p.namespace) || 0) + p.requests.cpuMillis);
  [...totals.entries()].sort((a, b) => b[1] - a[1]).forEach(([ns]) => nsColor(ns));

  podIndex.clear();
  for (const n of snapshot.nodes)
    for (const p of n.pods) podIndex.set(n.name + "￿" + p.uid, { pod: p, node: n });

  render();
}

function updateStatus() {
  const el = $("#status");
  if (!el) return;
  const stale = Date.now() - state.lastEventAt > 45000;
  el.classList.toggle("stale", stale);
  if (state.snapshot) $("#clock").textContent = fmtClock(state.snapshot.generatedAt);
}

// ---------- top-level render ----------

function render() {
  const snap = state.snapshot;
  if (!snap) return;
  $("#splash").hidden = true;

  const caps = snap.capabilities;

  // If actual usage is unavailable, fall back to the requests view.
  if (!caps.metrics && state.metric === "actual") state.metric = "requests";
  if (!caps.disk && state.dimension === "disk" && !snap.nodes.some((n) => n.disk.capacityBytes > 0))
    state.dimension = "cpu";
  if (state.dimension === "cost" && !priced(snap)) state.dimension = "cpu";

  renderControls(caps);
  renderBanners(caps);
  renderSummary(snap);
  renderLegend(snap);
  renderPending(snap.pending || []);
  renderGrid(snap);
  if (state.drill) {
    $("#overlay").hidden = false;
    renderDrill();
  }
  updateStatus();
}

// True when at least one node has a known hourly rate, so cost can be shown.
const priced = (snap) => snap.nodes.some((n) => n.hourlyUSD > 0);

function renderControls(caps) {
  for (const btn of document.querySelectorAll("[data-dim]")) {
    btn.setAttribute("aria-pressed", btn.dataset.dim === state.dimension);
    if (btn.dataset.dim === "disk") {
      const dead = !caps.disk && !state.snapshot.nodes.some((n) => n.disk.capacityBytes > 0);
      btn.disabled = dead;
      btn.title = dead ? "No disk signal available on this cluster" : "";
    }
    if (btn.dataset.dim === "cost") {
      btn.disabled = !priced(state.snapshot);
      btn.title = btn.disabled ? "No node rates known — set KUBO_COST_AZURE_NODE_HOURLY_USD" : "Estimated list price per hour";
    }
  }
  for (const btn of document.querySelectorAll("[data-metric]")) {
    btn.setAttribute("aria-pressed", btn.dataset.metric === state.metric);
    const inDisk = state.dimension === "disk";
    if (btn.dataset.metric === "actual") {
      btn.disabled = inDisk || !caps.metrics;
      btn.title = !caps.metrics ? (caps.metricsReason === "disabled" ? "Live usage is switched off" : "Metrics Server not detected") : "";
    } else {
      btn.disabled = inDisk;
    }
    if (inDisk) btn.title = "Disk is node-level in v1 — no per-pod metric";
  }
}

// Keyed by capabilities.*Reason. A signal the operator switched off is a
// choice, not a fault, so it reads as a plain statement rather than a problem.
const METRICS_BANNERS = {
  disabled: "<strong>Live CPU/RAM usage is switched off.</strong> Showing reserved capacity (requests/limits) only.",
  forbidden: "<strong>No permission to read the Metrics Server.</strong> Showing reserved capacity (requests/limits) only — grant get/list on metrics.k8s.io for actual usage.",
  unavailable: "<strong>Metrics Server not responding.</strong> Showing reserved capacity (requests/limits) until it answers again.",
};
const METRICS_BANNER_DEFAULT = "<strong>Metrics Server not detected.</strong> Showing reserved capacity (requests/limits) only — actual usage is unavailable on this cluster.";
const DISK_BANNERS = {
  disabled: "<strong>Live disk usage is switched off.</strong> Disk shows capacity only.",
  forbidden: "<strong>No permission for live disk stats.</strong> The kubelet Summary API needs get on nodes/stats — disk shows capacity only.",
};
const DISK_BANNER_DEFAULT = "<strong>Live disk stats unavailable.</strong> The kubelet Summary API could not be reached — disk shows capacity only.";

function renderBanners(caps) {
  const banners = [];
  if (!caps.metrics) banners.push(METRICS_BANNERS[caps.metricsReason] ?? METRICS_BANNER_DEFAULT);
  if (!caps.disk) banners.push(DISK_BANNERS[caps.diskReason] ?? DISK_BANNER_DEFAULT);
  $("#banners").innerHTML = banners.map((b) => `<div class="banner">${b}</div>`).join("");
}

function renderSummary(snap) {
  let cpuA = 0, cpuR = 0, cpuU = 0, memA = 0, memR = 0, memU = 0;
  let dskA = 0, dskU = 0, pods = 0, ready = 0, anyUsage = false, anyDisk = false;
  for (const n of snap.nodes) {
    cpuA += n.allocatable.cpuMillis; memA += n.allocatable.memBytes;
    dskA += n.disk.capacityBytes;
    if (n.disk.live) { dskU += n.disk.usedBytes; anyDisk = true; }
    if (n.ready) ready++;
    if (n.hasUsage) { cpuU += n.usage.cpuMillis; memU += n.usage.memBytes; anyUsage = true; }
    pods += n.pods.length;
    for (const p of n.pods) { cpuR += p.requests.cpuMillis; memR += p.requests.memBytes; }
  }
  const tile = (k, v, sub, frac) => `
    <div class="stat">
      <div class="k">${k}</div>
      <div class="v">${v}</div>
      ${frac != null ? `<div class="bar"><i style="width:${Math.min(100, frac * 100).toFixed(1)}%"></i></div>` : ""}
      <div class="sub">${sub}</div>
    </div>`;
  const usedSub = (u, r, a, fmt) => anyUsage
    ? `used ${fmt(u)} · reserved ${fmt(r)}`
    : `reserved ${fmt(r)} of ${fmt(a)}`;
  const listPerHour = snap.nodes.reduce((s, n) => s + (n.hourlyUSD || 0), 0);
  const reservedPerHour = snap.nodes.reduce((s, n) => s + n.pods.reduce((t, p) => t + (p.cost?.requests || 0), 0), 0);
  $("#summary").innerHTML =
    tile("Nodes", `${snap.nodes.length} <small>${ready} ready</small>`, "&nbsp;", null) +
    tile("Pods", `${pods}`, "&nbsp;", null) +
    (priced(snap)
      ? tile("Cost", fmtUSD(listPerHour), `reserved ${fmtUSD(reservedPerHour)} · ≈ $${Math.round(listPerHour * 730).toLocaleString()}/mo`, listPerHour > 0 ? reservedPerHour / listPerHour : 0)
      : "") +
    tile("CPU", anyUsage ? fmtPct(cpuU / cpuA) : fmtPct(cpuR / cpuA), usedSub(cpuU, cpuR, cpuA, fmtCPU), (anyUsage ? cpuU : cpuR) / cpuA) +
    tile("Memory", anyUsage ? fmtPct(memU / memA) : fmtPct(memR / memA), usedSub(memU, memR, memA, fmtBytes), (anyUsage ? memU : memR) / memA) +
    tile("Disk", anyDisk ? fmtPct(dskU / dskA) : "—", anyDisk ? `used ${fmtBytes(dskU)} of ${fmtBytes(dskA)}` : `capacity ${fmtBytes(dskA)} · usage unavailable`, anyDisk ? dskU / dskA : 0);
}

function renderLegend(snap) {
  const seen = new Map();
  for (const n of snap.nodes)
    for (const p of n.pods) seen.set(p.namespace, (seen.get(p.namespace) || 0) + 1);
  const named = [...seen.keys()].filter((ns) => nsSlots.get(ns) < NS_COLORS.length)
    .sort((a, b) => nsSlots.get(a) - nsSlots.get(b));
  const overflow = [...seen.keys()].filter((ns) => nsSlots.get(ns) >= NS_COLORS.length);
  let html = `<span class="cap">Namespaces</span>`;
  for (const ns of named)
    html += `<button class="chip" data-ns="${esc(ns)}"><span class="sw" style="background:${nsColor(ns)}"></span>${esc(ns)}</button>`;
  if (overflow.length)
    html += `<button class="chip" data-ns="__other"><span class="sw" style="background:${OTHER}"></span>other (${overflow.length})</button>`;
  $("#legend").innerHTML = html;
}

// ---------- pending pods ----------

// Pods waiting for a node flash until the scheduler places them. Chips are
// keyed by pod UID and reused across snapshots, so a refresh does not restart
// the flash. A pod that gets scheduled leaves this strip and shows up on its
// node as a new tile.
const pendingChips = new Map();

function renderPending(pods) {
  const section = $("#pending");
  const list = $("#pending-list");
  section.hidden = pods.length === 0;

  const live = new Set(pods.map((p) => p.uid));
  for (const [uid, chip] of pendingChips)
    if (!live.has(uid)) { chip.remove(); pendingChips.delete(uid); }

  // Chips are inserted once, in server order, and never moved: re-inserting a
  // node restarts its CSS animation.
  let prev = null;
  for (const pod of pods) {
    let chip = pendingChips.get(pod.uid);
    if (!chip) {
      chip = buildPendingChip(pod);
      pendingChips.set(pod.uid, chip);
      list.insertBefore(chip, prev ? prev.nextSibling : list.firstChild);
    }
    chip.querySelector(".pending-reason").textContent = pod.reason || "Waiting for a node";
    prev = chip;
  }
}

function buildPendingChip(pod) {
  const chip = document.createElement("div");
  chip.className = "pchip is-pending";
  chip.title = `${pod.namespace}/${pod.name}`;
  const sw = document.createElement("span");
  sw.className = "sw";
  sw.style.background = nsColor(pod.namespace);
  const name = document.createElement("span");
  name.className = "pending-name";
  name.textContent = pod.name;
  const reason = document.createElement("span");
  reason.className = "pending-reason";
  chip.append(sw, name, reason);
  return chip;
}

// ---------- node grid ----------

function renderGrid(snap) {
  const grid = $("#grid");
  const mode = `${state.dimension}|${state.metric}`;
  if (mode !== renderedMode) {
    grid.innerHTML = "";
    cards.clear();
    renderedMode = mode;
  }

  const liveNames = new Set(snap.nodes.map((n) => n.name));
  for (const [name, entry] of cards)
    if (!liveNames.has(name)) { entry.card.remove(); cards.delete(name); }

  for (const node of snap.nodes) {
    let entry = cards.get(node.name);
    if (!entry) {
      entry = buildCard(node);
      cards.set(node.name, entry);
      grid.appendChild(entry.card);
    }
    updateCard(entry, node);
  }
}

function buildCard(node) {
  const card = document.createElement("button");
  card.className = "card";
  card.setAttribute("aria-label", `Node ${node.name} — open detail view`);
  card.addEventListener("click", () => openDrill(node.name));

  const head = document.createElement("div");
  head.className = "card-head";
  card.appendChild(head);

  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("height", String(NODE_H));
  card.appendChild(svg);

  const foot = document.createElement("div");
  foot.className = "card-foot";
  card.appendChild(foot);

  return { card, svg, head, foot };
}

function updateCard(entry, node) {
  const { head, foot, svg } = entry;
  const dim = state.dimension;

  let headHTML = `<span class="nname">${esc(node.name)}</span>`;
  for (const r of node.roles || []) headHTML += `<span class="role">${esc(r)}</span>`;
  if (!node.ready) headHTML += `<span class="notready">✕ NotReady</span>`;

  if (dim === "disk") {
    // The bar carries the number; the header stays quiet.
    head.innerHTML = headHTML;
    foot.innerHTML = "";
    renderDiskSVG(svg, node, svgWidth(svg), NODE_H);
    return;
  }

  const alloc = nodeAlloc(node, dim);
  const sumVal = node.pods.reduce((s, p) => s + podValue(p, dim, state.metric), 0);
  const over = alloc > 0 ? sumVal / alloc : 0;
  const k = dimKey(dim);
  const usedSum = node.pods.reduce((s, p) => s + (p.hasUsage ? p.usage[k] : 0), 0);

  if (state.metric === "actual" && node.hasUsage && dim !== "cost") {
    headHTML += `<span class="pct">${fmtPct((node.usage[k] || usedSum) / alloc)}<small> used · ${fmtPct(node.pods.reduce((s, p) => s + p.requests[k], 0) / alloc)} res</small></span>`;
  } else {
    headHTML += `<span class="pct">${fmtPct(sumVal / alloc)}<small> ${state.metric === "limits" ? "limit" : "reserved"}</small></span>`;
  }
  if (over > 1.001) headHTML += `<span class="over">over ×${over.toFixed(1)}</span>`;
  head.innerHTML = headHTML;

  const noReq = state.metric !== "actual"
    ? node.pods.filter((p) => podValue(p, dim, state.metric) <= 0).length : 0;
  foot.innerHTML = `<span>${node.pods.length} pods</span>` +
    `<span>alloc ${fmtValue(dim, alloc)}</span>` +
    (noReq ? `<span>${noReq} without ${state.metric}</span>` : "");

  renderTreemapSVG(svg, node, svgWidth(svg), NODE_H);
}

function svgWidth(svg) {
  const w = svg.clientWidth || svg.parentElement?.clientWidth || 320;
  return Math.max(240, w);
}

// ---------- treemap rendering (SVG renderer) ----------

function ensureHatch(svg) {
  if (svg._hatch) return svg._hatch;
  const id = `hatch-${hatchSeq++}`;
  const defs = document.createElementNS(SVG, "defs");
  defs.innerHTML =
    `<pattern id="${id}" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">` +
    `<rect width="7" height="7" style="fill: var(--surface-2)"/>` +
    `<line x1="0" y1="0" x2="0" y2="7" style="stroke: var(--surface-3)" stroke-width="1.6"/>` +
    `</pattern>`;
  svg.appendChild(defs);
  svg._hatch = id;
  return id;
}

function renderTreemapSVG(svg, node, W, H, rich = false) {
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);
  const hatch = ensureHatch(svg);
  if (!svg._tiles) svg._tiles = new Map();

  const dim = state.dimension, metric = state.metric;
  const alloc = nodeAlloc(node, dim);

  // Fold the long tail so tiles stay clickable (PRD §9.6).
  let items = node.pods
    .map((p) => ({ value: podValue(p, dim, metric), pod: p }))
    .filter((it) => it.value > 0)
    .sort((a, b) => b.value - a.value);
  const maxTiles = rich ? 120 : MAX_TILES;
  if (items.length > maxTiles) {
    const rest = items.slice(maxTiles - 1);
    items = items.slice(0, maxTiles - 1);
    items.push({
      value: rest.reduce((s, it) => s + it.value, 0),
      pod: { uid: "__more", name: `+${rest.length} more pods`, namespace: "__more" },
      more: rest.length,
    });
  }

  const sum = items.reduce((s, it) => s + it.value, 0);
  const total = Math.max(alloc, sum);
  const freeFrac = total > 0 ? (total - sum) / total : 1;
  const { packed, free } = splitFree(0, 0, W, H, freeFrac);

  const wanted = new Set();

  if (packed && sum > 0) {
    const rects = squarify(items, packed.x, packed.y, packed.w, packed.h);
    for (const r of rects) {
      const uid = r.item.pod.uid;
      wanted.add(uid);
      let g = svg._tiles.get(uid);
      if (!g) {
        g = buildTile(svg, r.item.pod, node.name);
        svg._tiles.set(uid, g);
      }
      noteTileChange(g, r.item.pod, svg._seeded);
      placeTile(g, r, dim, metric, rich);
    }
  }

  // Free / unallocated block — hatched, so "empty" never looks like data.
  wanted.add("__free");
  let fg = svg._tiles.get("__free");
  if (!fg) {
    fg = document.createElementNS(SVG, "g");
    fg.classList.add("freeblock");
    const rect = document.createElementNS(SVG, "rect");
    rect.setAttribute("fill", `url(#${hatch})`);
    const label = document.createElementNS(SVG, "text");
    fg.append(rect, label);
    svg.appendChild(fg);
    svg._tiles.set("__free", fg);
  }
  if (free) {
    fg.style.opacity = 1;
    fg.style.transform = `translate(${free.x + 1}px, ${free.y + 1}px)`;
    const rect = fg.querySelector("rect");
    rect.style.width = `${Math.max(0, free.w - 2)}px`;
    rect.style.height = `${Math.max(0, free.h - 2)}px`;
    const label = fg.querySelector("text");
    if (free.w > 74 && free.h > 26) {
      label.textContent = `FREE ${fmtPct(freeFrac)}`;
      label.setAttribute("x", (free.w - 2) / 2);
      label.setAttribute("y", (free.h - 2) / 2 + 4);
      label.setAttribute("text-anchor", "middle");
    } else label.textContent = "";
  } else {
    fg.style.opacity = 0;
  }

  for (const [uid, g] of svg._tiles)
    if (!wanted.has(uid)) { g.remove(); svg._tiles.delete(uid); }
  svg._seeded = true;
}

// A tile flashes when its pod appears, restarts, or changes phase or
// readiness. The first render only records state, so a page load does not
// flash every pod.
function noteTileChange(g, pod, seeded) {
  const sig = `${pod.phase}|${pod.ready}|${pod.restarts}`;
  const prevSig = g.dataset.sig;
  const prevRestarts = Number(g.dataset.restarts || 0);
  g.dataset.sig = sig;
  g.dataset.restarts = pod.restarts;
  if (!seeded) return;
  if (prevSig === undefined) return flashTile(g, "is-new");
  if (prevSig === sig) return;
  flashTile(g, pod.restarts > prevRestarts ? "is-restart" : "is-changed");
}

function flashTile(g, kind) {
  g.classList.remove("is-new", "is-restart", "is-changed");
  void g.getBoundingClientRect();
  g.classList.add(kind);
  clearTimeout(g._flashTimer);
  g._flashTimer = setTimeout(() => g.classList.remove(kind), 2600);
}

function buildTile(svg, pod, nodeName) {
  const g = document.createElementNS(SVG, "g");
  g.classList.add("tile");
  g.dataset.uid = pod.uid;
  g.dataset.node = nodeName;
  g.dataset.ns = pod.namespace;
  const slack = document.createElementNS(SVG, "rect");
  slack.classList.add("slack");
  const fill = document.createElementNS(SVG, "rect");
  fill.classList.add("fill");
  const rsv = document.createElementNS(SVG, "rect");
  rsv.classList.add("rsv");
  const lbl = document.createElementNS(SVG, "text");
  lbl.classList.add("lbl");
  const val = document.createElementNS(SVG, "text");
  val.classList.add("val");
  g.append(slack, fill, rsv, lbl, val);
  svg.appendChild(g);
  return g;
}

function placeTile(g, r, dim, metric, rich) {
  const pod = r.item.pod;
  const color = nsColor(pod.namespace);
  const pad = 1; // 2px visual gap between neighbours (1px each side)
  const x = r.x + pad, y = r.y + pad;
  const w = Math.max(0, r.w - pad * 2), h = Math.max(0, r.h - pad * 2);

  g.style.transform = `translate(${x}px, ${y}px)`;

  const [slack, fill, rsv] = [g.children[0], g.children[1], g.children[2]];
  const setRect = (el, rx, ry, rw, rh) => {
    el.style.x = `${rx}px`; el.style.y = `${ry}px`;
    el.style.width = `${Math.max(0, rw)}px`; el.style.height = `${Math.max(0, rh)}px`;
  };

  slack.setAttribute("fill", color);
  fill.setAttribute("fill", color);
  rsv.setAttribute("stroke", color);

  const k = dimKey(dim);
  let showValue = null;
  g.classList.remove("overreq");

  if (metric !== "actual" || pod.uid === "__more" || dim === "cost") {
    // Solid tile: the whole block is the chosen metric.
    setRect(slack, 0, 0, 0, 0);
    setRect(fill, 0, 0, w, h);
    setRect(rsv, 0, 0, 0, 0);
    rsv.style.display = "none";
    showValue = r.item.value;
  } else {
    // Dual encoding — the signature view. Tile area = max(request, usage);
    // dashed outline = the reservation; solid inner block = actual usage,
    // anchored bottom-left so tiles read as "filling up".
    rsv.style.display = "";
    const req = pod.requests?.[k] ?? 0;
    const usage = pod.hasUsage ? pod.usage[k] : 0;
    const tileVal = Math.max(req, usage, 1);
    const uf = Math.sqrt(usage / tileVal);
    const uw = w * uf, uh = h * uf;
    setRect(slack, 0, 0, w, h);
    setRect(fill, 0, h - uh, uw, uh);
    if (usage > req && req > 0) {
      const rf = Math.sqrt(req / tileVal);
      setRect(rsv, 0.6, h - h * rf + 0.6, w * rf - 1.2, h * rf - 1.2);
      g.classList.add("overreq");
    } else {
      setRect(rsv, 0.6, 0.6, w - 1.2, h - 1.2);
    }
    showValue = usage;
  }

  const [lbl, val] = [g.children[3], g.children[4]];
  // Solid tiles sit on a saturated namespace fill, so their label takes black
  // or white by contrast. Washed tiles keep the theme ink with a surface halo.
  const solid = metric !== "actual" || pod.uid === "__more";
  const labelFill = solid ? labelInk(color) : null;
  lbl.style.fill = val.style.fill = labelFill ?? "";
  lbl.style.stroke = solid ? "none" : "";
  const minW = rich ? 54 : 62, minH = rich ? 22 : 26;
  if (w > minW && h > minH) {
    lbl.textContent = truncate(pod.name, w / 6.2);
    lbl.setAttribute("x", 5);
    lbl.setAttribute("y", 14);
  } else lbl.textContent = "";
  if (w > minW && h > minH + 16 && showValue != null) {
    val.textContent = fmtValue(dim, showValue);
    val.setAttribute("x", 5);
    val.setAttribute("y", 27);
  } else val.textContent = "";
}

function truncate(s, chars) {
  return s.length > chars ? s.slice(0, Math.max(1, chars - 1)) + "…" : s;
}

// ---------- disk rendering ----------

function renderDiskSVG(svg, node, W, H) {
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);
  svg.replaceChildren();
  svg._tiles = null;
  svg._hatch = null;
  const hatch = ensureHatch(svg);

  const g = document.createElementNS(SVG, "g");
  g.classList.add("diskbar");
  svg.appendChild(g);

  const { capacityBytes: cap, usedBytes: used, live } = node.disk;
  const frac = live && cap > 0 ? used / cap : 0;
  if (frac >= 0.9) g.classList.add("crit");
  else if (frac >= 0.75) g.classList.add("warn");

  const barY = H * 0.46, barH = 30, barX = 10, barW = W - 20;
  const mk = (name, attrs, text) => {
    const el = document.createElementNS(SVG, name);
    for (const [a, v] of Object.entries(attrs)) el.setAttribute(a, v);
    if (text != null) el.textContent = text;
    g.appendChild(el);
    return el;
  };

  mk("text", { class: "bigpct", x: barX, y: 36 }, live && cap > 0 ? fmtPct(frac) : "—");
  if (frac >= 0.9) mk("text", { class: "alerttxt", x: barX + 78, y: 36 }, "⚠ critically low space");
  else if (frac >= 0.75) mk("text", { class: "alerttxt", x: barX + 78, y: 36 }, "⚠ filling up");

  mk("rect", { class: "track", x: barX, y: barY, width: barW, height: barH, rx: 6 });
  mk("rect", { x: barX, y: barY, width: barW, height: barH, rx: 6, fill: `url(#${hatch})`, opacity: 0.5 });
  if (live && cap > 0)
    mk("rect", { class: "used disk-fill", x: barX, y: barY, width: Math.max(2, barW * Math.min(1, frac)), height: barH, rx: 6 });

  if (live && cap > 0) {
    mk("text", { class: "detail", x: barX, y: barY + barH + 24 },
      `${fmtBytes(used)} used of ${fmtBytes(cap)} · ${fmtBytes(node.disk.availableBytes)} free`);
  } else if (cap > 0) {
    mk("text", { class: "detail", x: barX, y: barY + barH + 24 }, `capacity ${fmtBytes(cap)}`);
    // Terse on purpose: the banner above carries the full explanation, and a
    // longer string clips at the card edge.
    mk("text", { class: "note", x: barX, y: barY + barH + 42 },
      state.snapshot.capabilities.diskReason === "disabled" ? "live usage switched off" : "live usage unavailable");
  } else {
    mk("text", { class: "note", x: barX, y: barY + barH + 24 }, "no disk signal for this node");
  }
}

// ---------- tooltip ----------

const tooltip = () => $("#tooltip");

document.addEventListener("mousemove", (e) => {
  const tile = e.target.closest?.(".tile");
  const tip = tooltip();
  if (!tile) { tip.classList.remove("show"); return; }
  const key = tile.dataset.node + "￿" + tile.dataset.uid;
  const hit = podIndex.get(key);
  if (tile.dataset.uid === "__more") {
    tip.innerHTML = `<div class="t-name">smaller pods</div><div class="t-ns">folded to keep tiles readable — open the node for the full list</div>`;
  } else if (hit) {
    tip.innerHTML = tooltipHTML(hit.pod);
  } else return;
  tip.classList.add("show");
  const pad = 14;
  let x = e.clientX + pad, y = e.clientY + pad;
  const r = tip.getBoundingClientRect();
  if (x + r.width > innerWidth - 8) x = e.clientX - r.width - pad;
  if (y + r.height > innerHeight - 8) y = e.clientY - r.height - pad;
  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;
});

function tooltipHTML(pod) {
  if (state.dimension === "cost") {
    const rows = [
      ["request", fmtUSD(pod.cost.requests)],
      ["limit", pod.limits.cpuMillis > 0 || pod.limits.memBytes > 0 ? fmtUSD(pod.cost.limits) : "none"],
    ];
    if (pod.hasUsage) rows.push(["actual", fmtUSD(pod.cost.actual)]);
    return `<div class="t-name">${esc(pod.name)}</div>` +
      `<div class="t-ns"><span class="sw" style="background:${nsColor(pod.namespace)}"></span>${esc(pod.namespace)}</div>` +
      rows.map(([k, v]) => `<div class="t-row"><span>${k}</span><b>${v}</b></div>`).join("");
  }
  const dim = state.dimension === "mem" ? "mem" : "cpu";
  const k = dimKey(dim);
  const rows = [
    ["request", fmtValue(dim, pod.requests[k])],
    ["limit", pod.limits[k] > 0 ? fmtValue(dim, pod.limits[k]) : "none"],
  ];
  if (pod.hasUsage) {
    rows.push(["actual", fmtValue(dim, pod.usage[k])]);
    if (pod.requests[k] > 0)
      rows.push(["of request", fmtPct(pod.usage[k] / pod.requests[k])]);
  }
  return `<div class="t-name">${esc(pod.name)}</div>` +
    `<div class="t-ns"><span class="sw" style="background:${nsColor(pod.namespace)}"></span>${esc(pod.namespace)}</div>` +
    `<table>${rows.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join("")}</table>`;
}

// Legend hover → spotlight one namespace across every node.
document.addEventListener("mouseover", (e) => {
  const chip = e.target.closest?.(".chip");
  if (!chip) return;
  const ns = chip.dataset.ns;
  for (const t of document.querySelectorAll(".tile")) {
    const mine = ns === "__other"
      ? nsSlots.get(t.dataset.ns) >= NS_COLORS.length
      : t.dataset.ns === ns;
    t.classList.toggle("dimmed", !mine);
  }
});
document.addEventListener("mouseout", (e) => {
  if (!e.target.closest?.(".chip")) return;
  for (const t of document.querySelectorAll(".tile")) t.classList.remove("dimmed");
});

// ---------- drill-in ----------

function openDrill(nodeName) {
  state.drill = nodeName;
  $("#overlay").hidden = false;
  renderDrill();
  $("#overlay .close")?.focus();
}

function closeDrill() {
  const name = state.drill;
  state.drill = null;
  $("#overlay").hidden = true;
  cards.get(name)?.card.focus();
}

function renderDrill() {
  const node = state.snapshot?.nodes.find((n) => n.name === state.drill);
  if (!node) { closeDrill(); return; }
  const panel = $("#overlay .panel");

  const dim = state.dimension;
  const meta = dim === "disk"
    ? `${node.pods.length} pods`
    : `${node.pods.length} pods · allocatable ${fmtValue(dim, nodeAlloc(node, dim))}`;
  panel.querySelector(".panel-head .nname").textContent = node.name;
  panel.querySelector(".panel-head .meta").textContent = meta;

  const holder = panel.querySelector(".panel-viz");
  let svg = holder.querySelector("svg");
  if (!svg || svg.dataset.mode !== renderedMode) {
    holder.replaceChildren();
    svg = document.createElementNS(SVG, "svg");
    svg.dataset.mode = renderedMode;
    holder.appendChild(svg);
  }
  const W = Math.max(400, holder.clientWidth || 900);
  if (dim === "disk") renderDiskSVG(svg, node, W, 230);
  else renderTreemapSVG(svg, node, W, 430, true);

  panel.querySelector(".panel-table").innerHTML = podTableHTML(node);
}

function podTableHTML(node) {
  if (state.dimension === "cost") {
    const byCost = [...node.pods].sort((a, b) => podValue(b, "cost", state.metric) - podValue(a, "cost", state.metric));
    const rows = byCost.map((p) => {
      const reqPct = p.hasUsage && p.cost.requests > 0 ? p.cost.actual / p.cost.requests : null;
      return `<tr>
      <td class="podname"><span class="sw" style="background:${nsColor(p.namespace)}"></span>${esc(p.name)}</td>
      <td>${esc(p.namespace)}</td>
      <td>${fmtUSD(p.cost.requests)}</td>
      <td>${p.limits.cpuMillis > 0 || p.limits.memBytes > 0 ? fmtUSD(p.cost.limits) : "—"}</td>
      <td>${p.hasUsage ? fmtUSD(p.cost.actual) : "—"}</td>
      <td class="${reqPct != null && reqPct > 1 ? "hot" : ""}">${reqPct != null ? fmtPct(reqPct) : "—"}</td>
    </tr>`;
    }).join("");
    return `<table class="podtable">
    <caption>Pods on ${esc(node.name)} — list price per hour</caption>
    <thead><tr><th>Pod</th><th>Namespace</th><th>Request</th><th>Limit</th><th>Actual</th><th>% of req</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
  }
  const dim = state.dimension === "mem" ? "mem" : "cpu";
  const k = dimKey(dim);
  const pods = [...node.pods].sort((a, b) => podValue(b, dim, state.metric) - podValue(a, dim, state.metric));
  const rows = pods.map((p) => {
    const reqPct = p.hasUsage && p.requests[k] > 0 ? p.usage[k] / p.requests[k] : null;
    return `<tr>
      <td class="podname"><span class="sw" style="background:${nsColor(p.namespace)}"></span>${esc(p.name)}</td>
      <td>${esc(p.namespace)}</td>
      <td>${fmtValue(dim, p.requests[k])}</td>
      <td>${p.limits[k] > 0 ? fmtValue(dim, p.limits[k]) : "—"}</td>
      <td>${p.hasUsage ? fmtValue(dim, p.usage[k]) : "—"}</td>
      <td class="${reqPct != null && reqPct > 1 ? "hot" : ""}">${reqPct != null ? fmtPct(reqPct) : "—"}</td>
    </tr>`;
  }).join("");
  return `<table class="podtable">
    <caption>Pods on ${esc(node.name)} — ${dim === "cpu" ? "CPU" : "memory"}</caption>
    <thead><tr><th>Pod</th><th>Namespace</th><th>Request</th><th>Limit</th><th>Actual</th><th>% of req</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ---------- controls ----------

for (const btn of document.querySelectorAll("[data-dim]"))
  btn.addEventListener("click", () => {
    state.dimension = btn.dataset.dim;
    localStorage.setItem("kshows.dimension", state.dimension);
    render();
  });
for (const btn of document.querySelectorAll("[data-metric]"))
  btn.addEventListener("click", () => {
    state.metric = btn.dataset.metric;
    localStorage.setItem("kshows.metric", state.metric);
    render();
  });

$("#overlay").addEventListener("click", (e) => {
  if (e.target === $("#overlay") || e.target.closest(".close")) closeDrill();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.drill) closeDrill();
});

let resizeTimer;
addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    renderedMode = ""; // force full rebuild at the new width
    render();
  }, 150);
});

bootstrap();
