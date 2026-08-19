import { buildEmailLogsSearch } from './utils';

describe('buildEmailLogsSearch', () => {
  it('converts the inclusive window end to the exclusive `to` bound', () => {
    const search = buildEmailLogsSearch({
      startTime: new Date('2026-08-01T00:00:00.000Z').getTime(),
      endTime: new Date('2026-08-07T23:59:59.999Z').getTime(),
      page: 1,
      pageSize: 20,
    });

    expect(search).toStrictEqual({
      from: '2026-08-01T00:00:00.000Z',
      to: '2026-08-08T00:00:00.000Z',
      page: '1',
      page_size: '20',
    });
  });

  it('emits a lone start bound without inventing the other', () => {
    const search = buildEmailLogsSearch({
      startTime: new Date('2026-08-01T00:00:00.000Z').getTime(),
      recipient: 'user@example.com',
      page: 2,
      pageSize: 20,
    });

    expect(search).toStrictEqual({
      from: '2026-08-01T00:00:00.000Z',
      recipient: 'user@example.com',
      page: '2',
      page_size: '20',
    });
  });

  it('omits absent bounds while always paging', () => {
    expect(buildEmailLogsSearch({ page: 3, pageSize: 20 })).toStrictEqual({
      page: '3',
      page_size: '20',
    });
  });

  it('passes the recipient through only when non-empty', () => {
    expect(
      buildEmailLogsSearch({ recipient: 'user@example.com', page: 1, pageSize: 20 })
    ).toStrictEqual({
      recipient: 'user@example.com',
      page: '1',
      page_size: '20',
    });
    expect(buildEmailLogsSearch({ recipient: '', page: 1, pageSize: 20 })).toStrictEqual({
      page: '1',
      page_size: '20',
    });
  });
});
