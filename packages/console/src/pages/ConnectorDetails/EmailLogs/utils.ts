import { conditional } from '@silverhand/essentials';

type WindowInput = {
  /** Window start in epoch milliseconds; omitted when the picker has no valid start. */
  startTime?: number;
  /** Inclusive window end in epoch milliseconds, as produced by the audit-log time window. */
  endTime?: number;
  /** Full recipient address; the endpoint matches it case-insensitively and exactly. */
  recipient?: string;
  /** 1-based page index. */
  page: number;
  /** Rows per page, forwarded as the endpoint's `page_size`. */
  pageSize: number;
};

/**
 * Translate the picker window, recipient filter, and page into the email-logs endpoint's
 * search parameters. The picker window's end is inclusive; the endpoint's `to` bound is
 * exclusive, hence the one-millisecond shift.
 */
export const buildEmailLogsSearch = ({
  startTime,
  endTime,
  recipient,
  page,
  pageSize,
}: WindowInput) => ({
  ...conditional(startTime !== undefined && { from: new Date(startTime).toISOString() }),
  ...conditional(endTime !== undefined && { to: new Date(endTime + 1).toISOString() }),
  ...conditional(recipient && { recipient }),
  page: String(page),
  page_size: String(pageSize),
});
