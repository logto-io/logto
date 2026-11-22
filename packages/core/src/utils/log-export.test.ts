import RequestError from '#src/errors/RequestError/index.js';
import { decodeLogExportCursor, encodeLogExportCursor } from '#src/utils/log-export.js';

describe('log export cursor', () => {
  const cursor = {
    createdAt: '2026-11-11T04:40:45.123456Z',
    id: 'log-id',
  };

  it('round-trips the exact timestamp and id', () => {
    expect(decodeLogExportCursor(encodeLogExportCursor(cursor))).toEqual(cursor);
  });

  it('returns undefined when the cursor is omitted', () => {
    expect(decodeLogExportCursor()).toBeUndefined();
  });

  it.each([
    ['empty', ''],
    ['whitespace', '   '],
    ['not base64 JSON', 'not-a-cursor'],
    [
      'invalid timestamp',
      Buffer.from(JSON.stringify({ createdAt: '2026-99-99T00:00:00.000000Z', id: 'id' })).toString(
        'base64url'
      ),
    ],
    [
      'missing microseconds',
      Buffer.from(JSON.stringify({ createdAt: '2026-11-11T04:40:45Z', id: 'id' })).toString(
        'base64url'
      ),
    ],
    [
      'empty id',
      Buffer.from(JSON.stringify({ createdAt: cursor.createdAt, id: '' })).toString('base64url'),
    ],
  ])('rejects a %s cursor', (_name, value) => {
    const getError = () => {
      try {
        decodeLogExportCursor(value);
      } catch (error) {
        return error;
      }
    };

    expect(getError()).toBeInstanceOf(RequestError);
    expect(getError()).toMatchObject({ code: 'guard.invalid_input' });
  });
});
