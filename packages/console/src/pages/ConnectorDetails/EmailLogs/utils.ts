import { conditional } from '@silverhand/essentials';

type WindowInput = {
  /** Window start in epoch milliseconds; omitted when the picker has no valid start. */
  startTime?: number;
  /** Inclusive window end in epoch milliseconds, as produced by the audit-log time window. */
  endTime?: number;
  /** Full recipient address; the endpoint matches it case-insensitively and exactly. */
  recipient?: string;
  cursor?: string;
};

/**
 * Translate the picker window, recipient filter, and cursor into the email-logs endpoint's
 * search parameters. The picker window's end is inclusive; the endpoint's `to` bound is
 * exclusive, hence the one-millisecond shift.
 */
export const buildEmailLogsSearch = ({ startTime, endTime, recipient, cursor }: WindowInput) => ({
  ...conditional(startTime !== undefined && { from: new Date(startTime).toISOString() }),
  ...conditional(endTime !== undefined && { to: new Date(endTime + 1).toISOString() }),
  ...conditional(recipient && { recipient }),
  ...conditional(cursor && { cursor }),
});
