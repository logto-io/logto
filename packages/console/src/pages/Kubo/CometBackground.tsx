/* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods, @silverhand/fp/no-mutating-assign, @typescript-eslint/no-non-null-assertion, id-length -- Canvas animation state is intentionally mutable and index-based inside one effect. */
import { useEffect, useRef } from 'react';

// Comets that travel along faint circuit-like lines behind the Infrastructure pages.
// Adapted from meshx.io's hero background: 15 comets, brand-coloured tails, desktop only.
const cometCount = 15;
const desktopMinWidth = 1024;
const tailMin = 160;
const tailMax = 220;
const speedMin = 180;
const speedMax = 260;
const widthMin = 1.25;
const widthMax = 2.25;
const lineStep = 4;

type Point = { x: number; y: number };
type Track = { points: Point[]; lengths: number[]; total: number };
type Comet = {
  track: number;
  head: number;
  speed: number;
  tail: number;
  width: number;
  wait: number;
};

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

// Orthogonal routes across the viewport, like the hero's circuit lines.
const buildTracks = (width: number, height: number): Track[] => {
  const tracks: Track[] = [];
  const rows = Math.max(4, Math.round(height / 140));
  for (let i = 0; i < rows; i += 1) {
    let x = randomBetween(-40, width * 0.2);
    let y = (i + randomBetween(0.2, 0.8)) * (height / rows);
    const points: Point[] = [{ x, y }];
    while (x < width + 40) {
      const runX = randomBetween(120, 360);
      x += runX;
      points.push({ x, y });
      const dropY = y + randomBetween(-120, 120);
      y = Math.min(height + 20, Math.max(-20, dropY));
      points.push({ x, y });
    }
    const lengths: number[] = [0];
    for (let p = 1; p < points.length; p += 1) {
      const previous = points[p - 1]!;
      const current = points[p]!;
      const dx = current.x - previous.x;
      const dy = current.y - previous.y;
      lengths.push(lengths[p - 1]! + Math.hypot(dx, dy));
    }
    tracks.push({ points, lengths, total: lengths.at(-1) ?? 0 });
  }
  return tracks;
};

const pointAt = (track: Track, distance: number): Point => {
  const clamped = Math.min(Math.max(distance, 0), track.total);
  let index = 1;
  while (index < track.lengths.length - 1 && track.lengths[index]! < clamped) {
    index += 1;
  }
  const from = track.points[index - 1]!;
  const to = track.points[index]!;
  const span = track.lengths[index]! - track.lengths[index - 1]!;
  const t = span === 0 ? 0 : (clamped - track.lengths[index - 1]!) / span;
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
};

const spawn = (tracks: Track[], wait: number): Comet => ({
  track: Math.floor(Math.random() * tracks.length),
  head: 0,
  speed: randomBetween(speedMin, speedMax),
  tail: randomBetween(tailMin, tailMax),
  width: randomBetween(widthMin, widthMax),
  wait,
});

function CometBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || window.innerWidth < desktopMinWidth) {
      canvas.style.display = 'none';
      return;
    }

    let tracks: Track[] = [];
    let comets: Comet[] = [];
    let frame = 0;
    let last = performance.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      tracks = buildTracks(clientWidth, clientHeight);
      comets = Array.from({ length: cometCount }, (_, index) =>
        spawn(tracks, index * randomBetween(0.2, 1.2))
      );
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      for (const comet of comets) {
        if (comet.wait > 0) {
          comet.wait -= dt;
          continue;
        }

        const track = tracks[comet.track];
        if (!track) {
          continue;
        }

        comet.head += comet.speed * dt;
        const headAt = comet.head;
        const tailAt = Math.max(0, headAt - comet.tail);

        if (tailAt >= track.total) {
          Object.assign(comet, spawn(tracks, randomBetween(0.5, 3)));
          continue;
        }

        // Tail: a gradient from transparent to the brand colour, drawn as short segments.
        for (let d = tailAt; d < headAt; d += lineStep) {
          const from = pointAt(track, d);
          const to = pointAt(track, Math.min(d + lineStep, headAt));
          const progress = (d - tailAt) / Math.max(1, headAt - tailAt);
          context.strokeStyle = `rgba(254, 51, 10, ${(progress * 0.55).toFixed(3)})`;
          context.lineWidth = comet.width * (0.4 + progress * 0.6);
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
          context.stroke();
        }

        // Head: a small glow.
        const head = pointAt(track, headAt);
        const glow = context.createRadialGradient(head.x, head.y, 0, head.x, head.y, 10);
        glow.addColorStop(0, 'rgba(254, 51, 10, 0.85)');
        glow.addColorStop(1, 'rgba(254, 51, 10, 0)');
        context.fillStyle = glow;
        context.beginPath();
        context.arc(head.x, head.y, 10, 0, Math.PI * 2);
        context.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    frame = requestAnimationFrame((now) => {
      last = now;
      draw(now);
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="infra-comets" aria-hidden="true" />;
}

export default CometBackground;
/* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods, @silverhand/fp/no-mutating-assign, @typescript-eslint/no-non-null-assertion, id-length */
