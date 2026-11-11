import { Readable } from 'node:stream';

import type { LogExportCursor, LogExportRow } from '#src/queries/log.js';

export const logExportFormats = ['csv', 'jsonl'] as const;

type LogExportFormat = (typeof logExportFormats)[number];

/** Read one page of export rows, starting after the given cursor. */
type LogExportBatchLoader = (after?: LogExportCursor) => Promise<readonly LogExportRow[]>;

/** Read the newest matching row, used only to describe the exported range. */
type LogExportLastRowLoader = () => Promise<LogExportRow | undefined>;

type LogExportRange = {
  oldest: number;
  newest: number;
};

const csvHeader = 'tenantId,id,key,createdAt,payload';

/**
 * Quote a CSV cell when it contains a delimiter, a quote, or a line break. Payloads are JSON
 * objects, so this is the common case rather than an edge case.
 */
const escapeCsvCell = (value: string) =>
  /[\n\r",]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

const serializeCsvRow = (row: LogExportRow) => {
  const payload = JSON.stringify(row.payload);

  return [row.tenantId, row.id, row.key, String(row.createdAt), payload]
    .map((value) => escapeCsvCell(value))
    .join(',')
    .concat('\n');
};

const serializeJsonlRow = (row: LogExportRow) =>
  JSON.stringify({
    tenantId: row.tenantId,
    id: row.id,
    key: row.key,
    createdAt: row.createdAt,
    payload: row.payload,
  }).concat('\n');

const serializeRow = (row: LogExportRow, format: LogExportFormat) =>
  format === 'csv' ? serializeCsvRow(row) : serializeJsonlRow(row);

const contentTypes: Record<LogExportFormat, string> = {
  csv: 'text/csv; charset=utf-8',
  jsonl: 'application/x-ndjson; charset=utf-8',
};

export const getLogExportContentType = (format: LogExportFormat) => contentTypes[format];

export const buildLogExportFileName = (format: LogExportFormat) =>
  `logs-${new Date().toISOString().replaceAll(':', '-')}.${format}`;

/**
 * Yield the serialized export until the loader returns an empty page.
 *
 * A page is read, yielded, and then replaced by the next page, so memory tracks the page size
 * instead of the number of exported rows. The `after` cursor is the last row of the previous
 * page, which is what makes the keyset query resume exactly where it stopped even when several
 * rows share a millisecond.
 */
const createExportRows = async function* ({
  format,
  loadBatch,
  firstBatch,
}: {
  format: LogExportFormat;
  loadBatch: LogExportBatchLoader;
  firstBatch: readonly LogExportRow[];
}): AsyncGenerator<string> {
  if (format === 'csv') {
    yield `${csvHeader}\n`;
  }

  /* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation, no-await-in-loop -- The stream advances through keyset pages sequentially, which is stateful and must await each page. */
  let batch = firstBatch;
  let after: LogExportCursor | undefined;

  while (batch.length > 0) {
    for (const row of batch) {
      yield serializeRow(row, format);
    }

    const lastRow = batch.at(-1);

    // `batch` is non-empty here, so `lastRow` is always defined; the guard only narrows the type.
    if (!lastRow) {
      return;
    }

    after = { createdAt: lastRow.createdAtCursor, id: lastRow.id };
    batch = await loadBatch(after);
  }
  /* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation, no-await-in-loop */
};

/**
 * Build the CSV or JSONL download stream and the range of rows it contains.
 *
 * The first page and the newest row are loaded before this function resolves, so the route can
 * turn an initial database error into a normal error response before it commits the download
 * headers, and can report the range in headers before the body starts. Later page failures abort
 * the stream, which is why the API description tells clients to discard a truncated export.
 *
 * The range is measured before streaming starts. With `end_time` in the past and no concurrent
 * deletes, it describes exactly the rows the stream emits.
 */
export const createLogExportStream = async ({
  format,
  loadBatch,
  loadLast,
}: {
  format: LogExportFormat;
  loadBatch: LogExportBatchLoader;
  loadLast: LogExportLastRowLoader;
}) => {
  const [firstBatch, lastRow] = await Promise.all([loadBatch(), loadLast()]);
  const oldest = firstBatch[0]?.createdAt;
  const newest = lastRow?.createdAt;
  const range: LogExportRange | undefined =
    oldest === undefined || newest === undefined ? undefined : { oldest, newest };

  return {
    stream: Readable.from(createExportRows({ format, loadBatch, firstBatch })),
    range,
  };
};
