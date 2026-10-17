import { useEffect, useRef } from 'react';

/* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation -- The canvas animation carries its frame state across requestAnimationFrame callbacks, so the loop variables must be mutable. Geometry and comet updates below are pure. */

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

type Point = { readonly x: number; readonly y: number };
type Track = {
  readonly points: readonly Point[];
  readonly lengths: readonly number[];
  readonly total: number;
};
type Comet = {
  readonly track: number;
  readonly head: number;
  readonly speed: number;
  readonly tail: number;
  readonly width: number;
  readonly wait: number;
};

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

// Orthogonal route from the left edge to past the right edge, like the hero's circuit lines.
const routePoints = (start: Point, width: number, height: number): Point[] => {
  if (start.x >= width + 40) {
    return [];
  }

  const nextX = start.x + randomBetween(120, 360);
  const nextY = Math.min(height + 20, Math.max(-20, start.y + randomBetween(-120, 120)));

  return [
    { x: nextX, y: start.y },
    { x: nextX, y: nextY },
    ...routePoints({ x: nextX, y: nextY }, width, height),
  ];
};

// Cumulative distance along the route, so a comet can be placed by distance travelled.
const cumulativeLengths = (points: readonly Point[]): number[] =>
  points.reduce<number[]>((lengths, point, index) => {
    const previous = points[index - 1];

    if (!previous) {
      return [0];
    }

    const step = Math.hypot(point.x - previous.x, point.y - previous.y);

    return [...lengths, (lengths.at(-1) ?? 0) + step];
  }, []);

const buildTrack = (width: number, height: number, row: number, rows: number): Track => {
  const startX = randomBetween(-40, width * 0.2);
  const startY = (row + randomBetween(0.2, 0.8)) * (height / rows);
  const start = { x: startX, y: startY };
  const points = [start, ...routePoints(start, width, height)];
  const lengths = cumulativeLengths(points);

  return { points, lengths, total: lengths.at(-1) ?? 0 };
};

const buildTracks = (width: number, height: number): Track[] => {
  const rows = Math.max(4, Math.round(height / 140));

  return Array.from({ length: rows }, (_, row) => buildTrack(width, height, row, rows));
};

const pointAt = (track: Track, distance: number): Point => {
  const clamped = Math.min(Math.max(distance, 0), track.total);
  const found = track.lengths.findIndex((length, index) => index >= 1 && length >= clamped);
  const index = found === -1 ? track.lengths.length - 1 : found;
  const from = track.points[index - 1];
  const to = track.points[index];

  if (!from || !to) {
    return { x: 0, y: 0 };
  }

  const startLength = track.lengths[index - 1] ?? 0;
  const span = (track.lengths[index] ?? startLength) - startLength;
  const ratio = span === 0 ? 0 : (clamped - startLength) / span;

  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
};

const spawn = (tracks: readonly Track[], wait: number): Comet => ({
  track: Math.floor(Math.random() * tracks.length),
  head: 0,
  speed: randomBetween(speedMin, speedMax),
  tail: randomBetween(tailMin, tailMax),
  width: randomBetween(widthMin, widthMax),
  wait,
});

type StepResult = { readonly comet: Comet; readonly visible: boolean };

// Advances one comet by `dt` seconds. A comet that is waiting, has no track, or has left its
// track is not drawn this frame; a finished comet is respawned after a short pause.
const stepComet = (tracks: readonly Track[], comet: Comet, dt: number): StepResult => {
  if (comet.wait > 0) {
    return { comet: { ...comet, wait: comet.wait - dt }, visible: false };
  }

  const track = tracks[comet.track];

  if (!track) {
    return { comet, visible: false };
  }

  const head = comet.head + comet.speed * dt;

  if (Math.max(0, head - comet.tail) >= track.total) {
    return { comet: spawn(tracks, randomBetween(0.5, 3)), visible: false };
  }

  return { comet: { ...comet, head }, visible: true };
};

// Tail: a gradient from transparent to the brand colour, drawn as short segments. Head: a glow.
const drawComet = (context: CanvasRenderingContext2D, track: Track, comet: Comet) => {
  const headAt = comet.head;
  const tailAt = Math.max(0, headAt - comet.tail);
  const segmentCount = Math.max(0, Math.ceil((headAt - tailAt) / lineStep));

  for (const distance of Array.from(
    { length: segmentCount },
    (_, segment) => tailAt + segment * lineStep
  )) {
    const from = pointAt(track, distance);
    const to = pointAt(track, Math.min(distance + lineStep, headAt));
    const progress = (distance - tailAt) / Math.max(1, headAt - tailAt);
    context.strokeStyle = `rgba(254, 51, 10, ${(progress * 0.55).toFixed(3)})`;
    context.lineWidth = comet.width * (0.4 + progress * 0.6);
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  }

  const head = pointAt(track, headAt);
  const glow = context.createRadialGradient(head.x, head.y, 0, head.x, head.y, 10);
  glow.addColorStop(0, 'rgba(254, 51, 10, 0.85)');
  glow.addColorStop(1, 'rgba(254, 51, 10, 0)');
  context.fillStyle = glow;
  context.beginPath();
  context.arc(head.x, head.y, 10, 0, Math.PI * 2);
  context.fill();
};

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

      comets = comets.map((comet) => {
        const result = stepComet(tracks, comet, dt);
        const track = tracks[result.comet.track];

        if (result.visible && track) {
          drawComet(context, track, result.comet);
        }

        return result.comet;
      });

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

  return <canvas ref={canvasRef} className="infraComets" aria-hidden="true" />;
}

/* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation */

export default CometBackground;
