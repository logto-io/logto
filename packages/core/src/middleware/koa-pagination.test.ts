import type { Context } from 'koa';

import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

import type { WithPaginationContext } from './koa-pagination.js';
import koaPagination from './koa-pagination.js';

const { jest } = import.meta;

const next = jest.fn();
const setHeader = jest.fn();
const links = new Set<string>();
const appendHeader = jest.fn((key: string, value: string) => {
  if (key === 'Link') {
    links.add(value);
  }
});

const createContext = (query: Record<string, string>): WithPaginationContext<Context, false> => {
  const baseContext = createMockContext();
  const context = {
    ...baseContext,
    request: {
      ...baseContext.request,
      origin: '',
      path: '',
      query,
    },
    pagination: { limit: 0, offset: 0 },
    set: setHeader,
    append: appendHeader,
  };

  return context;
};

afterEach(() => {
  setHeader.mockClear();
  appendHeader.mockClear();
  links.clear();
});

describe('request', () => {
  it('should get limit and offset from queries', async () => {
    const ctx = createContext({ page: '1', page_size: '30' });
    await koaPagination()(ctx, async () => {
      ctx.pagination.totalCount = 100;
    });
    expect(ctx.pagination.limit).toEqual(30);
    expect(ctx.pagination.offset).toEqual(0);
  });

  it('should set default page to 1 (offset to 0) if non is provided', async () => {
    const ctx = createContext({});
    await koaPagination()(ctx, async () => {
      ctx.pagination.totalCount = 100;
    });
    expect(ctx.pagination.offset).toEqual(0);
  });

  it('should set default pageSize(limit) to 20', async () => {
    const ctx = createContext({});
    await koaPagination({ defaultPageSize: 20 })(ctx, async () => {
      ctx.pagination.totalCount = 100;
    });
    expect(ctx.pagination.limit).toEqual(20);
  });

  it('throw when page value is not number-like', async () => {
    const ctx = createContext({ page: 'invalid_number' });
    await expect(koaPagination()(ctx, next)).rejects.toThrow();
  });

  it('throw when page number is 0', async () => {
    const ctx = createContext({ page: '0' });
    await expect(koaPagination()(ctx, next)).rejects.toThrow();
  });

  it('throw when page_size value is not number-like', async () => {
    const ctx = createContext({ page_size: 'invalid_number' });
    await expect(koaPagination()(ctx, next)).rejects.toThrow();
  });

  it('throw when page_size number is 0', async () => {
    const ctx = createContext({ page_size: '0' });
    await expect(koaPagination()(ctx, next)).rejects.toThrow();
  });

  it('throw when page_size number exceeds max', async () => {
    const ctx = createContext({ page_size: '200' });
    await expect(koaPagination({ maxPageSize: 100 })(ctx, next)).rejects.toThrow();
  });
});

describe('response', () => {
  it('should throw without total count', async () => {
    const ctx = createContext({});
    await expect(koaPagination()(ctx, next)).rejects.toThrow();
  });

  it('should add Total-Number to response header', async () => {
    const ctx = createContext({});
    await koaPagination()(ctx, async () => {
      ctx.pagination.totalCount = 100;
    });
    expect(setHeader).toHaveBeenCalledWith('Total-Number', '100');
  });

  describe('Link in response header', () => {
    it('should append `first` and `last` in 1 of 1', async () => {
      const ctx = createContext({});
      await koaPagination({ defaultPageSize: 20 })(ctx, async () => {
        ctx.pagination.totalCount = 10;
      });
      expect(links.has('<?page=1>; rel="first"')).toBeTruthy();
      expect(links.has('<?page=1>; rel="last"')).toBeTruthy();
    });

    it('should append `first`, `next`, `last` in 1 of 2', async () => {
      const ctx = createContext({});
      await koaPagination({ defaultPageSize: 20 })(ctx, async () => {
        ctx.pagination.totalCount = 30;
      });
      expect(links.has('<?page=1>; rel="first"')).toBeTruthy();
      expect(links.has('<?page=2>; rel="next"')).toBeTruthy();
      expect(links.has('<?page=2>; rel="last"')).toBeTruthy();
    });

    it('should append `first`, `prev`, `last` in 2 of 2', async () => {
      const ctx = createContext({ page: '2' });
      await koaPagination({ defaultPageSize: 20 })(ctx, async () => {
        ctx.pagination.totalCount = 30;
      });
      expect(links.has('<?page=1>; rel="first"')).toBeTruthy();
      expect(links.has('<?page=1>; rel="prev"')).toBeTruthy();
      expect(links.has('<?page=2>; rel="last"')).toBeTruthy();
    });

    it('should append `first`, `prev`, `next`, `last` in 2 of 3', async () => {
      const ctx = createContext({ page: '2' });
      await koaPagination({ defaultPageSize: 20 })(ctx, async () => {
        ctx.pagination.totalCount = 50;
      });
      expect(links.has('<?page=1>; rel="first"')).toBeTruthy();
      expect(links.has('<?page=1>; rel="prev"')).toBeTruthy();
      expect(links.has('<?page=3>; rel="next"')).toBeTruthy();
      expect(links.has('<?page=3>; rel="last"')).toBeTruthy();
    });
  });
});

describe('capped totalCount', () => {
  it('emits `Total-Number-Is-Capped: true` and omits both `last` and `next` when capped', async () => {
    // Stripe-style: when the count is capped, the saturated `totalPage` is a
    // lie, so neither `last` nor `next` can be answered honestly. Both are
    // dropped together; clients walk by URL construction and stop on empty.
    const ctx = createContext({});
    await koaPagination({ defaultPageSize: 20 })(ctx, async () => {
      ctx.pagination.totalCount = 10_001;
      ctx.pagination.totalCountIsCapped = true;
    });
    expect(setHeader).toHaveBeenCalledWith('Total-Number', '10001');
    expect(setHeader).toHaveBeenCalledWith('Total-Number-Is-Capped', 'true');
    expect(links.has('<?page=1>; rel="first"')).toBeTruthy();
    expect([...links].some((link) => link.includes('rel="last"'))).toBeFalsy();
    expect([...links].some((link) => link.includes('rel="next"'))).toBeFalsy();
  });

  it('still emits `prev` when capped and not on the first page', async () => {
    const ctx = createContext({ page: '3' });
    await koaPagination({ defaultPageSize: 20 })(ctx, async () => {
      ctx.pagination.totalCount = 10_001;
      ctx.pagination.totalCountIsCapped = true;
    });
    expect(links.has('<?page=2>; rel="prev"')).toBeTruthy();
  });

  it('keeps full Link set when totalCountIsCapped is false', async () => {
    const ctx = createContext({});
    await koaPagination({ defaultPageSize: 20 })(ctx, async () => {
      ctx.pagination.totalCount = 30;
      ctx.pagination.totalCountIsCapped = false;
    });
    expect(setHeader).not.toHaveBeenCalledWith('Total-Number-Is-Capped', 'true');
    expect(links.has('<?page=2>; rel="last"')).toBeTruthy();
  });

  it('keeps full Link set when totalCountIsCapped is undefined', async () => {
    const ctx = createContext({});
    await koaPagination({ defaultPageSize: 20 })(ctx, async () => {
      ctx.pagination.totalCount = 30;
    });
    expect(setHeader).not.toHaveBeenCalledWith('Total-Number-Is-Capped', 'true');
    expect(links.has('<?page=2>; rel="last"')).toBeTruthy();
  });
});
