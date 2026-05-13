import { addDays, startOfDay } from 'date-fns';

import {
  customRange,
  defaultPresetRange,
  isPresetRange,
  parsePresetMs,
  presetRanges,
  resolveTimeWindow,
} from './preset';

describe('preset', () => {
  describe('isPresetRange', () => {
    it.each(presetRanges)('returns true for the canonical preset %s', (preset) => {
      expect(isPresetRange(preset)).toBe(true);
    });

    it.each(['', customRange, '5m', '1y', 'last 7 days'])(
      'returns false for non-preset value %p',
      (value) => {
        expect(isPresetRange(value)).toBe(false);
      }
    );
  });

  describe('parsePresetMs', () => {
    it.each([
      ['1h', 60 * 60 * 1000],
      ['1d', 24 * 60 * 60 * 1000],
      ['7d', 7 * 24 * 60 * 60 * 1000],
      ['30d', 30 * 24 * 60 * 60 * 1000],
    ])('translates %s into %d ms', (preset, expected) => {
      expect(parsePresetMs(preset)).toBe(expected);
    });

    it.each(['', customRange, '5m', '1y'])('returns undefined for non-preset value %p', (value) => {
      expect(parsePresetMs(value)).toBeUndefined();
    });
  });

  it('uses 7d as the default preset', () => {
    expect(defaultPresetRange).toBe('7d');
    expect(isPresetRange(defaultPresetRange)).toBe(true);
  });

  describe('resolveTimeWindow', () => {
    const fixedNow = new Date('2026-05-13T00:00:00Z').getTime();
    const now = () => fixedNow;

    it('returns a rolling lower bound for a known preset and no upper bound', () => {
      const window = resolveTimeWindow('7d', '', '', now);
      expect(window.startTime).toBe(fixedNow - 7 * 24 * 60 * 60 * 1000);
      expect(window.endTime).toBeUndefined();
    });

    it('falls back to the default preset for an unknown range value', () => {
      const window = resolveTimeWindow('bogus', '', '', now);
      expect(window.startTime).toBe(fixedNow - 7 * 24 * 60 * 60 * 1000);
      expect(window.endTime).toBeUndefined();
    });

    it('parses a yyyy-MM-dd custom range with bounds tuned for the API exclusive semantics', () => {
      const window = resolveTimeWindow(customRange, '2026-04-13', '2026-04-15', now);
      // Start: (startOfDay - 1ms) so `>` includes midnight of the picked day.
      expect(window.startTime).toBe(startOfDay(new Date(2026, 3, 13)).getTime() - 1);
      // End: startOfDay of the day _after_ so `<` includes 23:59:59.999 of the picked day.
      expect(window.endTime).toBe(startOfDay(addDays(new Date(2026, 3, 15), 1)).getTime());
    });

    it('drops malformed custom-range strings (regression: NaN crash)', () => {
      // Manual URL edit, e.g. `?range=custom&start_time=garbage`
      const window = resolveTimeWindow(customRange, 'garbage', '', now);
      expect(window.startTime).toBeUndefined();
      expect(window.endTime).toBeUndefined();
    });

    it('rejects full ISO timestamps so the table filter never disagrees with the input', () => {
      // Without the shape check, `parseISO('2026-04-13T00:00:00Z')` would succeed
      // and the API would be filtered while the date input renders blank.
      const window = resolveTimeWindow(customRange, '2026-04-13T00:00:00Z', '', now);
      expect(window.startTime).toBeUndefined();
    });

    it('omits a custom bound when its raw value is empty', () => {
      const window = resolveTimeWindow(customRange, '', '2026-04-15', now);
      expect(window.startTime).toBeUndefined();
      expect(window.endTime).toBe(startOfDay(addDays(new Date(2026, 3, 15), 1)).getTime());
    });
  });
});
