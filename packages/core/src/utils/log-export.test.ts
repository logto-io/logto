import { LogResult } from '@logto/schemas';

import type { LogExportRow } from '#src/queries/log.js';
import { streamToString } from '#src/utils/file.js';
import {
  buildLogExportFileName,
  createLogExportStream,
  getLogExportContentType,
} from '#src/utils/log-export.js';

const { jest } = import.meta;

const payload = (note: string): LogExportRow['payload'] => ({
  key: 'Interaction.SignIn',
  result: LogResult.Success,
  note,
});

const row = (
  id: string,
  logPayload: LogExportRow['payload'],
  createdAt: number,
  createdAtCursor: string
): LogExportRow => ({
  tenantId: 'tenant',
  id,
  key: 'Interaction.SignIn',
  payload: logPayload,
  createdAt,
  createdAtCursor,
});

describe('createLogExportStream()', () => {
  it('yields a CSV header and one escaped row per log', async () => {
    const expectedPayload = payload('a,b"c');
    const first = row('log-1', expectedPayload, 1000, '2020-09-13T12:26:40.001000Z');
    const loadBatch = jest.fn().mockResolvedValueOnce([first]).mockResolvedValueOnce([]);
    const loadLast = jest.fn().mockResolvedValue(first);

    const { stream, range } = await createLogExportStream({ format: 'csv', loadBatch, loadLast });
    const text = await streamToString(stream);
    const [header, csvRow, ...rest] = text.split('\n');

    expect(range).toEqual({ oldest: 1000, newest: 1000 });
    expect(header).toBe('tenantId,id,key,createdAt,payload');
    expect(rest).toEqual(['']);

    // Unquote the payload cell and parse it back, so the assertion covers both the JSON string
    // and the CSV quote doubling instead of hard-coding the escaped line.
    const match = /^tenant,log-1,Interaction\.SignIn,1000,"(.*)"$/.exec(csvRow ?? '');
    expect(match).not.toBeNull();
    expect(JSON.parse((match?.[1] ?? '').replaceAll('""', '"'))).toEqual(expectedPayload);
  });

  it('yields JSONL objects with the API field names', async () => {
    const expectedPayload = payload('a,b"c');
    const first = row('log-1', expectedPayload, 1000, '2020-09-13T12:26:40.001000Z');
    const loadBatch = jest.fn().mockResolvedValueOnce([first]).mockResolvedValueOnce([]);
    const loadLast = jest.fn().mockResolvedValue(first);

    const { stream } = await createLogExportStream({ format: 'jsonl', loadBatch, loadLast });
    const text = await streamToString(stream);

    expect(text).toBe(
      `${JSON.stringify({
        tenantId: 'tenant',
        id: 'log-1',
        key: 'Interaction.SignIn',
        createdAt: 1000,
        payload: expectedPayload,
      })}\n`
    );
  });

  it('requests the next page after the last row, using its exact cursor', async () => {
    const first = row('log-1', payload('page 1'), 1000, '2020-09-13T12:26:40.001000Z');
    const second = row('log-2', payload('page 2'), 2000, '2020-09-13T12:26:40.002000Z');
    const loadBatch = jest
      .fn()
      .mockResolvedValueOnce([first])
      .mockResolvedValueOnce([second])
      .mockResolvedValueOnce([]);
    const loadLast = jest.fn().mockResolvedValue(second);

    const { stream, range } = await createLogExportStream({
      format: 'jsonl',
      loadBatch,
      loadLast,
    });
    const text = await streamToString(stream);

    expect(range).toEqual({ oldest: first.createdAt, newest: second.createdAt });
    expect(text.trimEnd().split('\n')).toHaveLength(2);
    expect(loadBatch).toHaveBeenNthCalledWith(1);
    expect(loadBatch).toHaveBeenNthCalledWith(2, {
      createdAt: first.createdAtCursor,
      id: first.id,
    });
    expect(loadBatch).toHaveBeenNthCalledWith(3, {
      createdAt: second.createdAtCursor,
      id: second.id,
    });
  });

  it('still emits the CSV header when nothing matches', async () => {
    const loadBatch = jest.fn().mockResolvedValueOnce([]);
    const loadLast = jest.fn();

    const { stream, range } = await createLogExportStream({ format: 'csv', loadBatch, loadLast });
    expect(range).toBeUndefined();
    await expect(streamToString(stream)).resolves.toBe('tenantId,id,key,createdAt,payload\n');
  });

  it('emits nothing when a JSONL export has no matches', async () => {
    const loadBatch = jest.fn().mockResolvedValueOnce([]);
    const loadLast = jest.fn();

    const { stream } = await createLogExportStream({ format: 'jsonl', loadBatch, loadLast });
    await expect(streamToString(stream)).resolves.toBe('');
  });

  it('rejects before returning a stream when the first page fails', async () => {
    const loadBatch = jest.fn().mockRejectedValue(new Error('database unavailable'));
    const loadLast = jest.fn();

    await expect(createLogExportStream({ format: 'csv', loadBatch, loadLast })).rejects.toThrow(
      'database unavailable'
    );
  });

  it('builds the download headers from the format', () => {
    expect(getLogExportContentType('csv')).toBe('text/csv; charset=utf-8');
    expect(getLogExportContentType('jsonl')).toBe('application/x-ndjson; charset=utf-8');
    expect(buildLogExportFileName('csv')).toMatch(/^logs-.+\.csv$/);
    expect(buildLogExportFileName('jsonl')).toMatch(/^logs-.+\.jsonl$/);
  });
});
