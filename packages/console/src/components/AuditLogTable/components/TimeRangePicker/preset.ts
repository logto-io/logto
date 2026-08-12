import { addDays, endOfDay, isValid, parseISO, startOfDay } from 'date-fns';

/** Canonical preset names persisted in the URL (`?range=…`). */
export const presetRanges = ['1h', '1d', '7d', '30d'] as const;

export type PresetRange = (typeof presetRanges)[number];

/** Value used in the URL when the user picks the custom-range option. */
export const customRange = 'custom';

/** Default preset selected on first render. */
export const defaultPresetRange: PresetRange = '7d';

const presetMs: Record<PresetRange, number> = {
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

/** Day-labelled presets that snap to start-of-day, in calendar-day units. */
const dayBoundaryPresetDays: Partial<Record<PresetRange, number>> = {
  '7d': 7,
  '30d': 30,
};

export const isPresetRange = (value: string): value is PresetRange =>
  Object.hasOwn(presetMs, value);

/** Translate a preset name into a millisecond offset, or `undefined` if unknown. */
export const parsePresetMs = (value: string): number | undefined =>
  isPresetRange(value) ? presetMs[value] : undefined;

/** Native `<input type="date">` shape — shared by the URL → input and URL → API paths. */
const dateInputShape = /^\d{4}-\d{2}-\d{2}$/;

/** Whether `raw` is a `yyyy-MM-dd` calendar-date string. */
export const isDateInputValue = (raw: string): boolean => dateInputShape.test(raw);

/**
 * Parse a `yyyy-MM-dd` value and apply `transform` in local time. Returns
 * `undefined` for empty / malformed input — keeps stray URL edits (full ISO
 * timestamps, garbage strings) from leaking into the filter.
 */
const parseDateAndTransform = (
  raw: string,
  transform: (date: Date) => Date
): number | undefined => {
  if (!raw || !isDateInputValue(raw)) {
    return undefined;
  }
  const parsed = parseISO(raw);
  return isValid(parsed) ? transform(parsed).getTime() : undefined;
};

/**
 * Resolve URL state into the absolute window the API expects. Bounds are
 * inclusive (`createdAt >= start_time AND createdAt <= end_time`). Callers
 * should memoize — the preset path snapshots `Date.now()` per call.
 */
export const resolveTimeWindow = (
  range: string,
  rawStartTime: string,
  rawEndTime: string,
  now: () => number = Date.now
): { startTime?: number; endTime?: number } => {
  if (range === customRange) {
    return {
      startTime: parseDateAndTransform(rawStartTime, (date) => startOfDay(date)),
      endTime: parseDateAndTransform(rawEndTime, (date) => endOfDay(date)),
    };
  }
  const presetRange: PresetRange = isPresetRange(range) ? range : defaultPresetRange;
  const daysBack = dayBoundaryPresetDays[presetRange];
  // `addDays` is calendar-aware so the snap stays on the right calendar day
  // across DST transitions.
  const startTime =
    daysBack === undefined
      ? now() - presetMs[presetRange]
      : startOfDay(addDays(now(), -daysBack)).getTime();
  return { startTime, endTime: undefined };
};
