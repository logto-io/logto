import { renderHook } from '@testing-library/react';
import { format } from 'date-fns';

import { customRange } from './preset';
import useAuditLogTimeWindow from './use-audit-log-time-window';

const dateInputPattern = 'yyyy-MM-dd';

type HookArgs = Parameters<typeof useAuditLogTimeWindow>[0];
type UpdateSearchParameters = HookArgs['updateSearchParameters'];
type UpdatePayload = Parameters<UpdateSearchParameters>[0];

const renderWith = (overrides: Partial<HookArgs> = {}) => {
  const updateSearchParameters = jest.fn<void, [UpdatePayload]>();
  const { result, rerender } = renderHook(
    (props: Partial<HookArgs>) =>
      useAuditLogTimeWindow({
        range: '7d',
        startTimeRaw: '',
        endTimeRaw: '',
        updateSearchParameters,
        ...overrides,
        ...props,
      }),
    { initialProps: {} }
  );
  return { result, rerender, updateSearchParameters };
};

describe('useAuditLogTimeWindow', () => {
  describe('handleRangeChange', () => {
    it('clears custom timestamps when switching from custom to a preset', () => {
      const { result, updateSearchParameters } = renderWith({
        range: customRange,
        startTimeRaw: '2026-04-13',
        endTimeRaw: '2026-04-15',
      });

      result.current.handleRangeChange({ range: '1d' });

      expect(updateSearchParameters).toHaveBeenCalledWith({
        range: '1d',
        page: undefined,
        start_time: undefined,
        end_time: undefined,
      });
    });

    it('seeds the custom inputs with the resolved window when switching to custom', () => {
      const { result, updateSearchParameters } = renderWith({
        range: '7d',
        startTimeRaw: '',
        endTimeRaw: '',
      });

      result.current.handleRangeChange({ range: customRange });

      // Avoid asserting on `Date.now()` race — assert structure + dateInput format.
      expect(updateSearchParameters).toHaveBeenCalledTimes(1);
      const [payload] = updateSearchParameters.mock.calls[0]!;
      expect(payload.range).toBe(customRange);
      expect(payload.page).toBeUndefined();
      expect(payload.start_time).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(payload.end_time).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('does not clobber custom dates when "custom" is re-selected while already on custom', () => {
      const { result, updateSearchParameters } = renderWith({
        range: customRange,
        startTimeRaw: '2026-04-13',
        endTimeRaw: '2026-04-15',
      });

      result.current.handleRangeChange({ range: customRange });

      expect(updateSearchParameters).toHaveBeenCalledWith({
        range: customRange,
        page: undefined,
      });
    });
  });

  describe('handleCustomDatesChange (regression: C1)', () => {
    it('preserves end_time when only startDate is supplied', () => {
      const { result, updateSearchParameters } = renderWith({
        range: customRange,
        startTimeRaw: '',
        endTimeRaw: '2026-04-15',
      });

      result.current.handleCustomDatesChange({ startDate: '2026-04-13' });

      // Critical: no `end_time` key in the call → existing URL value is left intact.
      expect(updateSearchParameters).toHaveBeenCalledWith({
        start_time: '2026-04-13',
        page: undefined,
      });
    });

    it('preserves start_time when only endDate is supplied', () => {
      const { result, updateSearchParameters } = renderWith({
        range: customRange,
        startTimeRaw: '2026-04-13',
        endTimeRaw: '',
      });

      result.current.handleCustomDatesChange({ endDate: '2026-04-15' });

      expect(updateSearchParameters).toHaveBeenCalledWith({
        end_time: '2026-04-15',
        page: undefined,
      });
    });

    it('clears a single bound when its value is undefined', () => {
      const { result, updateSearchParameters } = renderWith({
        range: customRange,
        startTimeRaw: '2026-04-13',
        endTimeRaw: '2026-04-15',
      });

      result.current.handleCustomDatesChange({ startDate: undefined });

      expect(updateSearchParameters).toHaveBeenCalledWith({
        start_time: undefined,
        page: undefined,
      });
    });
  });

  describe('toDateInputValue (indirectly via customStartDate / customEndDate)', () => {
    it('passes valid yyyy-MM-dd through unchanged', () => {
      const { result } = renderWith({
        range: customRange,
        startTimeRaw: '2026-04-13',
        endTimeRaw: '2026-04-15',
      });
      expect(result.current.customStartDate).toBe('2026-04-13');
      expect(result.current.customEndDate).toBe('2026-04-15');
    });

    it('drops malformed strings and empty values', () => {
      const { result } = renderWith({
        range: customRange,
        startTimeRaw: 'garbage',
        endTimeRaw: '',
      });
      expect(result.current.customStartDate).toBeUndefined();
      expect(result.current.customEndDate).toBeUndefined();
    });

    it('rejects full ISO timestamps that parse but break <input type="date">', () => {
      const { result } = renderWith({
        range: customRange,
        startTimeRaw: '2026-04-13T00:00:00Z',
        endTimeRaw: '',
      });
      expect(result.current.customStartDate).toBeUndefined();
    });
  });

  it('pickerRangeValue normalizes unknown URL values to the default preset', () => {
    const { result } = renderWith({ range: 'bogus' });
    expect(result.current.pickerRangeValue).toBe('7d');
  });

  it('exposes a memoized window: same inputs return referentially equal output', () => {
    const { result, rerender } = renderWith({ range: '7d' });
    const first = result.current.startTime;
    rerender({ range: '7d' });
    // Memoized: same inputs → same snapshot (avoids SWR cache thrash from Date.now() drift).
    expect(result.current.startTime).toBe(first);
  });

  it('formats Date.now() consistently with the date input pattern', () => {
    // Sanity guard: the `max` attribute and the seeded custom values share format.
    expect(format(Date.now(), dateInputPattern)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
