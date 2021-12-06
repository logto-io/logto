import { createMockContext } from '@shopify/jest-koa-mocks';
import { Context } from 'koa';

import koaPagination, { WithPaginationContext } from './koa-pagination';

const next = jest.fn();
const setHeader = jest.fn();
const links = new Set<string>();
const appendHeader = jest.fn((key: string, value: string) => {
  if (key === 'Link') {
    links.add(value);
  }
});

const createContext = (query: Record<string, string>): WithPaginationContext<Context> => {
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
    const context = createContext({ page: '1', page_size: '30' });
    await koaPagination()(context, next);
    expect(context.pagination.limit).toEqual(30);
    expect(context.pagination.offset).toEqual(0);
  });

  it('should set default page to 1 (offset to 0) if non is provided', async () => {
    const context = createContext({});
    await koaPagination()(context, next);
    expect(context.pagination.offset).toEqual(0);
  });

  it('should set default pageSize(limit) to 20', async () => {
    const context = createContext({});
    await koaPagination({ defaultPageSize: 20 })(context, next);
    expect(context.pagination.limit).toEqual(20);
  });

  it('throw when page value is not number-like', async () => {
    const context = createContext({ page: 'invalid_number' });
    await expect(koaPagination()(context, next)).rejects.toThrow();
  });

  it('throw when page number is 0', async () => {
    const context = createContext({ page: '0' });
    await expect(koaPagination()(context, next)).rejects.toThrow();
  });

  it('throw when page_size value is not number-like', async () => {
    const context = createContext({ page_size: 'invalid_number' });
    await expect(koaPagination()(context, next)).rejects.toThrow();
  });

  it('throw when page_size number is 0', async () => {
    const context = createContext({ page_size: '0' });
    await expect(koaPagination()(context, next)).rejects.toThrow();
  });

  it('throw when page_size number exceeds max', async () => {
    const context = createContext({ page_size: '200' });
    await expect(koaPagination({ maxPageSize: 100 })(context, next)).rejects.toThrow();
  });
});

/* eslint-disable @silverhand/fp/no-mutation */
describe('response', () => {
  it('should add Total-Number to response header', async () => {
    const context = createContext({});
    await koaPagination()(context, async () => {
      context.pagination.totalCount = 100;
    });
    expect(setHeader).toHaveBeenCalledWith('Total-Number', '100');
  });

  describe('Link in response header', () => {
    it('should append `first` and `last` in 1 of 1', async () => {
      const context = createContext({});
      await koaPagination({ defaultPageSize: 20 })(context, async () => {
        context.pagination.totalCount = 10;
      });
      expect(links.has('<?page=1>; rel="first"')).toBeTruthy();
      expect(links.has('<?page=1>; rel="last"')).toBeTruthy();
    });

    it('should append `first`, `next`, `last` in 1 of 2', async () => {
      const context = createContext({});
      await koaPagination({ defaultPageSize: 20 })(context, async () => {
        context.pagination.totalCount = 30;
      });
      expect(links.has('<?page=1>; rel="first"')).toBeTruthy();
      expect(links.has('<?page=2>; rel="next"')).toBeTruthy();
      expect(links.has('<?page=2>; rel="last"')).toBeTruthy();
    });

    it('should append `first`, `prev`, `last` in 2 of 2', async () => {
      const context = createContext({ page: '2' });
      await koaPagination({ defaultPageSize: 20 })(context, async () => {
        context.pagination.totalCount = 30;
      });
      expect(links.has('<?page=1>; rel="first"')).toBeTruthy();
      expect(links.has('<?page=1>; rel="prev"')).toBeTruthy();
      expect(links.has('<?page=2>; rel="last"')).toBeTruthy();
    });

    it('should append `first`, `prev`, `next`, `last` in 2 of 3', async () => {
      const context = createContext({ page: '2' });
      await koaPagination({ defaultPageSize: 20 })(context, async () => {
        context.pagination.totalCount = 50;
      });
      expect(links.has('<?page=1>; rel="first"')).toBeTruthy();
      expect(links.has('<?page=1>; rel="prev"')).toBeTruthy();
      expect(links.has('<?page=3>; rel="next"')).toBeTruthy();
      expect(links.has('<?page=3>; rel="last"')).toBeTruthy();
    });
  });
});
/* eslint-enable @silverhand/fp/no-mutation */
