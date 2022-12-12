import type { MiddlewareType } from 'koa';
import type { IMiddleware } from 'koa-router';
import { number } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { buildLink } from '#src/utils/pagination.js';

export type Pagination = {
  offset: number;
  limit: number;
  totalCount?: number;
};

export type WithPaginationContext<ContextT> = ContextT & {
  pagination: Pagination;
};

export type PaginationConfig = {
  defaultPageSize?: number;
  maxPageSize?: number;
};

export const isPaginationMiddleware = <Type extends IMiddleware>(
  function_: Type
): function_ is WithPaginationContext<Type> => function_.name === 'paginationMiddleware';

export const fallbackDefaultPageSize = 20;

export default function koaPagination<StateT, ContextT, ResponseBodyT>({
  defaultPageSize = fallbackDefaultPageSize,
  maxPageSize = 100,
}: PaginationConfig = {}): MiddlewareType<StateT, WithPaginationContext<ContextT>, ResponseBodyT> {
  // Name this anonymous function for the utility function `isPaginationMiddleware` to identify it
  const paginationMiddleware: MiddlewareType<
    StateT,
    WithPaginationContext<ContextT>,
    ResponseBodyT
  > = async (ctx, next) => {
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

    // Total count value should be returned, else return internal server-error.
    if (ctx.pagination.totalCount === undefined) {
      throw new Error('missing totalCount');
    }

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
  };

  return paginationMiddleware;
}
