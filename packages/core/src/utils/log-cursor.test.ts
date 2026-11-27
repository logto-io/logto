import RequestError from '#src/errors/RequestError/index.js';
import { decodeLogCursor, encodeLogCursor } from '#src/utils/log-cursor.js';

describe('log cursor', () => {
  const cursor = {
    createdAt: '2026-11-11T04:40:45.123456Z',
    id: 'log-id',
  };

  it('round-trips the exact timestamp and id', () => {
    expect(decodeLogCursor(encodeLogCursor(cursor))).toEqual(cursor);
  });

  it('returns undefined when the cursor is omitted', () => {
    expect(decodeLogCursor()).toBeUndefined();
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
      'zero year',
      Buffer.from(JSON.stringify({ createdAt: '0000-01-01T00:00:00.000000Z', id: 'id' })).toString(
        'base64url'
      ),
    ],
    [
      'non-UTC offset',
      Buffer.from(
        JSON.stringify({ createdAt: '2026-11-11T04:40:45.123456+00:00', id: 'id' })
      ).toString('base64url'),
    ],
    [
      'invalid offset',
      Buffer.from(
        JSON.stringify({ createdAt: '2026-11-11T04:40:45.123456+99:99', id: 'id' })
      ).toString('base64url'),
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
        decodeLogCursor(value);
      } catch (error) {
        return error;
      }
    };

    expect(getError()).toBeInstanceOf(RequestError);
    expect(getError()).toMatchObject({ code: 'guard.invalid_input' });
  });
});
