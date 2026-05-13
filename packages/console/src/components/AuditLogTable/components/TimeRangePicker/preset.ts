import { addDays, isValid, parseISO, startOfDay } from 'date-fns';

/**
 * Canonical preset names persisted in the URL (`?range=…`). Stable across
 * sessions and bookmarkable: `Date.now() - parsePresetMs('7d')` is always
 * "7 days before _now_" rather than a frozen window from the moment the link
 * was saved.
 */
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

export const isPresetRange = (value: string): value is PresetRange =>
  Object.hasOwn(presetMs, value);

/**
 * Translate a preset name (e.g. `'7d'`) into a millisecond offset suitable for
 * `Date.now() - parsePresetMs(range)`. Returns `undefined` for unknown inputs
 * so the caller can fall back to the default preset.
 */
export const parsePresetMs = (value: string): number | undefined =>
  isPresetRange(value) ? presetMs[value] : undefined;

/** Native `<input type="date">` shape — shared by the URL → input and URL → API paths. */
const dateInputShape = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Whether `raw` is a calendar-date string in the `yyyy-MM-dd` shape the picker
 * emits and the URL persists. Centralized so the URL → input check and the
 * URL → API filter cannot disagree (which would leave the input blank while
 * the table is still filtered by a parsed timestamp).
 */
export const isDateInputValue = (raw: string): boolean => dateInputShape.test(raw);

/**
 * Parse a `yyyy-MM-dd` calendar-date string (as emitted by a native
 * `<input type="date">`) and apply the supplied transform in the local
 * timezone. Returns `undefined` for empty, shape-mismatched, or unparseable
 * strings — guarding against stray query params that survive a manual URL
 * edit (e.g. a full ISO timestamp `parseISO` would otherwise accept).
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
 * Resolve URL state (`range` / `start_time` / `end_time`) into the absolute
 * window the API expects. Custom-range values are stored as `yyyy-MM-dd`
 * strings (matching the date input value); we widen them to whole-day local
 * boundaries here. Presets return a rolling lower bound and no upper bound.
 *
 * The API treats both bounds as exclusive (`createdAt > start_time AND
 * createdAt < end_time`). To honor the "include all events on the picked
 * date" expectation:
 *   * `start_time` is `(startOfDay - 1ms)` so `>` includes midnight itself.
 *   * `end_time` is `startOfDay` of the day _after_ the picked end date so
 *     `<` includes events up to `23:59:59.999` of the picked end date.
 *
 * Callers are expected to memoize the result — the preset path snapshots
 * `Date.now()` and would otherwise re-evaluate on every render and thrash any
 * URL-keyed cache (e.g. SWR).
 */
export const resolveTimeWindow = (
  range: string,
  rawStartTime: string,
  rawEndTime: string,
  now: () => number = Date.now
): { startTime?: number; endTime?: number } => {
  if (range === customRange) {
    return {
      startTime: parseDateAndTransform(
        rawStartTime,
        (date) => new Date(startOfDay(date).getTime() - 1)
      ),
      endTime: parseDateAndTransform(rawEndTime, (date) => startOfDay(addDays(date, 1))),
    };
  }
  const presetOffset = parsePresetMs(range) ?? parsePresetMs(defaultPresetRange);
  return {
    startTime: presetOffset === undefined ? undefined : now() - presetOffset,
    endTime: undefined,
  };
};
