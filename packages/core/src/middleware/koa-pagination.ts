import { MiddlewareType } from 'koa';
import { number } from 'zod';

import RequestError from '@/errors/RequestError';
import { buildLink } from '@/utils/pagination';

export interface Pagination {
  page: number; // Begin from 1
  size: number;
  count?: number;
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
      // Query values are all string, need to convert to number first.
      ctx.pagination = {
        page: ctx.request.query.page
          ? number().positive().parse(Number(ctx.request.query.page))
          : 1,
        size: ctx.request.query.per_page
          ? number().positive().max(maxPageSize).parse(Number(ctx.request.query.per_page))
          : defaultPageSize,
      };
    } catch {
      throw new RequestError({ code: 'guard.invalid_pagination', status: 400 });
    }

    await next();

    // Only handle response when count value is set.
    if (ctx.pagination.count !== undefined) {
      const { page, size, count } = ctx.pagination;
      const totalPage = Math.ceil(count / size) || 1; // Minimum page number is 1

      // Our custom response header: Total-Number
      ctx.set('Total-Number', String(count));

      // Response header's `Link`: https://datatracker.ietf.org/doc/html/rfc5988
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
