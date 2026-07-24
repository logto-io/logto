import { format, isValid, parseISO } from 'date-fns';
import { useMemo } from 'react';

import {
  type PresetRange,
  customRange,
  defaultPresetRange,
  isDateInputValue,
  isPresetRange,
  resolveTimeWindow,
} from './preset';

const dateInputPattern = 'yyyy-MM-dd';

/**
 * Validate a raw URL value before handing it to the date input. Empty,
 * shape-mismatched, or unparseable strings collapse to `undefined`. Shares
 * `isDateInputValue` with the API-side parser so the input and the filter
 * cannot disagree on what counts as a valid custom-range value.
 */
const toDateInputValue = (raw: string): string | undefined => {
  if (!raw || !isDateInputValue(raw)) {
    return undefined;
  }
  return isValid(parseISO(raw)) ? raw : undefined;
};

type UpdateSearchParameters = (parameters: Record<string, string | number | undefined>) => void;

type Args = {
  range: string;
  startTimeRaw: string;
  endTimeRaw: string;
  updateSearchParameters: UpdateSearchParameters;
};

type Result = {
  /** Absolute lower bound in unix-ms; `undefined` when no bound is active. */
  startTime?: number;
  /** Absolute upper bound in unix-ms; `undefined` when no bound is active. */
  endTime?: number;
  /** Either a known preset or `'custom'`; never a stray string from the URL. */
  pickerRangeValue: PresetRange | typeof customRange;
  /** `yyyy-MM-dd` string suitable for the custom-range date input, or `undefined`. */
  customStartDate?: string;
  /** `yyyy-MM-dd` string suitable for the custom-range date input, or `undefined`. */
  customEndDate?: string;
  /** Update the preset URL state and reset pagination + custom timestamps. */
  handleRangeChange: (next: { range: PresetRange | typeof customRange }) => void;
  /**
   * Partial update of the custom-range URL state. Only mutates the fields
   * explicitly present in `next` — passing `{ startDate: '…' }` leaves
   * `end_time` alone, preventing accidental erasure of the other bound.
   */
  handleCustomDatesChange: (next: { startDate?: string; endDate?: string }) => void;
};

/**
 * Encapsulates the URL-state ↔ time-window contract for the Audit Logs page:
 * snapshots a memoized window per URL change (preventing SWR cache thrash from
 * a per-render `Date.now()`), exposes typed handlers that also clear the
 * surrounding state, and normalizes arbitrary URL strings down to a known
 * preset or `'custom'`.
 */
const useAuditLogTimeWindow = ({
  range,
  startTimeRaw,
  endTimeRaw,
  updateSearchParameters,
}: Args): Result => {
  const { startTime, endTime } = useMemo(
    () => resolveTimeWindow(range, startTimeRaw, endTimeRaw),
    [range, startTimeRaw, endTimeRaw]
  );

  const pickerRangeValue: PresetRange | typeof customRange = isPresetRange(range)
    ? range
    : range === customRange
      ? customRange
      : defaultPresetRange;

  const handleRangeChange: Result['handleRangeChange'] = ({ range: nextRange }) => {
    if (nextRange === customRange) {
      // Switching to custom from a preset: seed the date inputs with the
      // current resolved window so the rows on screen remain continuous
      // instead of silently broadening to the full retention window.
      // When already on `custom`, leave any existing dates intact.
      const isAlreadyCustom = range === customRange;
      const seedStart =
        !isAlreadyCustom && startTime !== undefined
          ? format(startTime, dateInputPattern)
          : undefined;
      const seedEnd = isAlreadyCustom ? undefined : format(Date.now(), dateInputPattern);
      updateSearchParameters({
        range: nextRange,
        page: undefined,
        ...(seedStart !== undefined && { start_time: seedStart }),
        ...(seedEnd !== undefined && { end_time: seedEnd }),
      });
      return;
    }
    // Preset path: drop any custom-range leftovers.
    updateSearchParameters({
      range: nextRange,
      page: undefined,
      start_time: undefined,
      end_time: undefined,
    });
  };

  const handleCustomDatesChange: Result['handleCustomDatesChange'] = (next) => {
    updateSearchParameters({
      ...('startDate' in next && { start_time: next.startDate ?? undefined }),
      ...('endDate' in next && { end_time: next.endDate ?? undefined }),
      page: undefined,
    });
  };

  return {
    startTime,
    endTime,
    pickerRangeValue,
    customStartDate: toDateInputValue(startTimeRaw),
    customEndDate: toDateInputValue(endTimeRaw),
    handleRangeChange,
    handleCustomDatesChange,
  };
};

export default useAuditLogTimeWindow;
