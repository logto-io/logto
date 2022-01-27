import { MiddlewareType } from 'koa';
import { number } from 'zod';

import RequestError from '@/errors/RequestError';
import { buildLink } from '@/utils/pagination';

export interface Pagination {
  offset: number;
  limit: number;
  totalCount?: number;
}

export type WithPaginationContext<ContextT> = ContextT & {
  pagination: Pagination;
};

export interface PaginationConfig {
  defaultPageSize?: number;
  maxPageSize?: number;
}

export default function koaPagination<StateT, ContextT, ResponseBodyT>({
  defaultPageSize = 20,
  maxPageSize = 100,
}: PaginationConfig = {}): MiddlewareType<StateT, WithPaginationContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    try {
      const {
        request: {
          query: { page, page_size },
        },
      } = ctx;
      // Query values are all string, need to convert to number first.
      const pageNumber = page ? number().positive().parse(Number(page)) : 1;
      const pageSize = page_size
        ? number().positive().max(maxPageSize).parse(Number(page_size))
        : defaultPageSize;

      ctx.pagination = { offset: (pageNumber - 1) * pageSize, limit: pageSize };
    } catch {
      throw new RequestError({ code: 'guard.invalid_pagination', status: 400 });
    }

    await next();

    // Only handle response when count value is set.
    if (ctx.pagination.totalCount !== undefined) {
      const { limit, offset, totalCount } = ctx.pagination;
      const totalPage = Math.ceil(totalCount / limit) || 1; // Minimum page number is 1

      // Our custom response header: Total-Number
      ctx.set('Total-Number', String(totalCount));

      // Response header's `Link`: https://datatracker.ietf.org/doc/html/rfc5988
      const page = Math.floor(offset / limit) + 1; // Start from 1
      ctx.append('Link', buildLink(ctx.request, 1, 'first'));
      ctx.append('Link', buildLink(ctx.request, totalPage, 'last'));

      if (page > 1) {
        ctx.append('Link', buildLink(ctx.request, page - 1, 'prev'));
      }

      if (page < totalPage) {
        ctx.append('Link', buildLink(ctx.request, page + 1, 'next'));
      }
    }
  };
}
