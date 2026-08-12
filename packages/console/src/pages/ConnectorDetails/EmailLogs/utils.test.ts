import { buildEmailLogsSearch } from './utils';

describe('buildEmailLogsSearch', () => {
  it('converts the inclusive window end to the exclusive `to` bound', () => {
    const search = buildEmailLogsSearch({
      startTime: new Date('2026-08-01T00:00:00.000Z').getTime(),
      endTime: new Date('2026-08-07T23:59:59.999Z').getTime(),
    });

    expect(search).toStrictEqual({
      from: '2026-08-01T00:00:00.000Z',
      to: '2026-08-08T00:00:00.000Z',
    });
  });

  it('omits absent bounds and the cursor entirely', () => {
    expect(buildEmailLogsSearch({})).toStrictEqual({});
  });

  it('passes the recipient through only when non-empty', () => {
    expect(buildEmailLogsSearch({ recipient: 'user@example.com' })).toStrictEqual({
      recipient: 'user@example.com',
    });
    expect(buildEmailLogsSearch({ recipient: '' })).toStrictEqual({});
  });

  it('passes the cursor through verbatim alongside the window', () => {
    const search = buildEmailLogsSearch({
      startTime: new Date('2026-08-01T00:00:00.000Z').getTime(),
      cursor: 'opaque-cursor',
    });

    expect(search).toStrictEqual({
      from: '2026-08-01T00:00:00.000Z',
      cursor: 'opaque-cursor',
    });
  });
});
