const { jest } = import.meta;

export const createMockCommonQueryMethods = () => ({
  any: jest.fn(),
  anyFirst: jest.fn(),
  exists: jest.fn(),
  many: jest.fn(),
  manyFirst: jest.fn(),
  maybeOne: jest.fn(),
  maybeOneFirst: jest.fn(),
  one: jest.fn(),
  oneFirst: jest.fn(),
  query: jest.fn().mockResolvedValue({ rows: [] }),
  transaction: jest.fn(),
});

export const expectSqlString = (sql: string): unknown =>
  expect.objectContaining({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    sql: expect.stringContaining(sql),
  });
