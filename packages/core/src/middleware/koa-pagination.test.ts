import { createMockContext } from '@shopify/jest-koa-mocks';
import { Context } from 'koa';

import koaPagination, { WithPaginationContext } from './koa-pagination';

const next = jest.fn();
const setHeader = jest.fn();
const appendHeader = jest.fn();

const createContext = (query: Record<string, string>): WithPaginationContext<Context> => {
  const baseContext = createMockContext();
  const context = {
    ...baseContext,
    request: {
      ...baseContext.request,
      query,
    },
    pagination: { page: 0, size: 0 },
    set: setHeader,
    append: appendHeader,
  };
  return context;
};

afterEach(() => {
  setHeader.mockClear();
  appendHeader.mockClear();
});

describe('request', () => {
  it('should get page and size from queries', async () => {
    const context = createContext({ page: '1', per_page: '30' });
    await koaPagination()(context, next);
    expect(context.pagination.page).toEqual(1);
    expect(context.pagination.size).toEqual(30);
  });

  it('should set default page to 1', async () => {
    const context = createContext({});
    await koaPagination()(context, next);
    expect(context.pagination.page).toEqual(1);
  });

  it('should set default size to 20', async () => {
    const context = createContext({});
    await koaPagination({ defaultPageSize: 20 })(context, next);
    expect(context.pagination.size).toEqual(20);
  });

  it('throw when page value is not number-like', async () => {
    const context = createContext({ page: 'invalid_number' });
    await expect(koaPagination()(context, next)).rejects.toThrow();
  });

  it('throw when page number is 0', async () => {
    const context = createContext({ page: '0' });
    await expect(koaPagination()(context, next)).rejects.toThrow();
  });

  it('throw when per_page value is not number-like', async () => {
    const context = createContext({ per_page: 'invalid_number' });
    await expect(koaPagination()(context, next)).rejects.toThrow();
  });

  it('throw when per_page number is 0', async () => {
    const context = createContext({ per_page: '0' });
    await expect(koaPagination()(context, next)).rejects.toThrow();
  });

  it('throw when per_page number exceeds max', async () => {
    const context = createContext({ per_page: '200' });
    await expect(koaPagination({ maxPageSize: 100 })(context, next)).rejects.toThrow();
  });
});

describe('response', () => {
  it('should add Total-Number to response header', async () => {
    const context = createContext({});
    await koaPagination()(context, async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      context.pagination.count = 100;
    });
    expect(setHeader).toHaveBeenCalledWith('Total-Number', '100');
  });

  describe('Link in response header', () => {
    it('should append 2 times in 1 of 1 (first, last)', async () => {
      const context = createContext({});
      await koaPagination({ defaultPageSize: 20 })(context, async () => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        context.pagination.count = 10;
      });
      expect(appendHeader).toHaveBeenCalledTimes(2);
    });

    it('should append 3 times in 1 of 2 (first, next, last)', async () => {
      const context = createContext({});
      await koaPagination({ defaultPageSize: 20 })(context, async () => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        context.pagination.count = 30;
      });
      expect(appendHeader).toHaveBeenCalledTimes(3);
    });

    it('should append 3 times in 2 of 2 (first, prev, last)', async () => {
      const context = createContext({ page: '2' });
      await koaPagination({ defaultPageSize: 20 })(context, async () => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        context.pagination.count = 30;
      });
      expect(appendHeader).toHaveBeenCalledTimes(3);
    });

    it('should append 4 times in 2 of 3 (first, prev, next last)', async () => {
      const context = createContext({ page: '2' });
      await koaPagination({ defaultPageSize: 20 })(context, async () => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        context.pagination.count = 50;
      });
      expect(appendHeader).toHaveBeenCalledTimes(4);
    });
  });
});
