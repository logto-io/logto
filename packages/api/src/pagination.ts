import type {
  Client,
  ClientPathsWithMethod,
  MaybeOptionalInit,
  MethodResponse,
} from 'openapi-fetch';

type GetOperation<
  Paths extends NonNullable<unknown>,
  Path extends keyof Paths,
> = Paths[Path] extends {
  get: infer Operation;
}
  ? Operation
  : never;

type OperationQuery<Operation> = Operation extends {
  parameters: { query?: infer Query };
}
  ? NonNullable<Query>
  : never;

type SupportsPagination<Operation> = [OperationQuery<Operation>] extends [never]
  ? false
  : 'page' extends keyof OperationQuery<Operation>
    ? 'page_size' extends keyof OperationQuery<Operation>
      ? true
      : false
    : false;

type GetPath<Paths extends NonNullable<unknown>> = ClientPathsWithMethod<Client<Paths>, 'get'>;

type PaginatedGetPath<Paths extends NonNullable<unknown>> = {
  [Path in GetPath<Paths>]: SupportsPagination<GetOperation<Paths, Path>> extends true
    ? MethodResponse<Client<Paths>, 'get', Path> extends readonly unknown[]
      ? Path
      : never
    : never;
}[GetPath<Paths>];

type PaginationItem<Paths extends NonNullable<unknown>, Path extends PaginatedGetPath<Paths>> =
  MethodResponse<Client<Paths>, 'get', Path> extends ReadonlyArray<infer Item> ? Item : never;

type GetInit<
  Paths extends NonNullable<unknown>,
  Path extends PaginatedGetPath<Paths>,
> = MaybeOptionalInit<{ get: GetOperation<Paths, Path> }, 'get'>;

type PaginationOptions<
  Paths extends NonNullable<unknown>,
  Path extends PaginatedGetPath<Paths>,
> = Omit<NonNullable<GetInit<Paths, Path>>, 'parseAs'> & { parseAs?: never };

type PaginationInit<Paths extends NonNullable<unknown>, Path extends PaginatedGetPath<Paths>> =
  undefined extends GetInit<Paths, Path>
    ? [PaginationOptions<Paths, Path>?]
    : [PaginationOptions<Paths, Path>];

/** Iterates over items returned by a paginated Management API GET endpoint. */
export type PaginateMethod<Paths extends NonNullable<unknown>> = <
  Path extends PaginatedGetPath<Paths>,
>(
  path: Path,
  ...init: PaginationInit<Paths, Path>
) => AsyncGenerator<PaginationItem<Paths, Path>, void, undefined>;

type RuntimePaginationOptions = {
  [key: string]: unknown;
  params?: {
    [key: string]: unknown;
    query?: Record<string, unknown>;
  };
  parseAs?: unknown;
};

type RuntimePageResult = {
  data?: unknown;
  error?: unknown;
  response: Response;
};

type RuntimeGet = (path: string, options: RuntimePaginationOptions) => Promise<RuntimePageResult>;

const defaultPageSize = 100;

const hasNextLink = (headers: Headers) =>
  headers
    .get('Link')
    ?.split(',')
    .some((link) => /;\s*rel=(?:"next"|next)(?:\s*;|\s*$)/iu.test(link.trim())) ?? false;

const isTotalNumberCapped = (headers: Headers) =>
  headers.get('Total-Number-Is-Capped')?.toLowerCase() === 'true';

/** An error response returned while iterating over a paginated Management API endpoint. */
export class ManagementApiPaginationError extends Error {
  /**
   * The error response metadata and headers. Its body has already been read by openapi-fetch; the
   * parsed error body is available as `cause`.
   */
  readonly response: Response;

  readonly status: number;

  constructor(response: Response, options?: ErrorOptions) {
    super(`Management API pagination request failed with status ${response.status}`, options);
    this.name = 'ManagementApiPaginationError';
    this.response = response;
    this.status = response.status;
  }
}

/** Creates a typed pagination method backed by an openapi-fetch GET method. */
export const createPaginate = <Paths extends NonNullable<unknown>>(
  get: Client<Paths>['GET']
): PaginateMethod<Paths> => {
  // eslint-disable-next-line no-restricted-syntax -- The runtime adapter narrows openapi-fetch's generic GET method after the public type validates the path and options.
  const getPage = get as RuntimeGet;

  const paginate = (
    path: string,
    options: RuntimePaginationOptions = {}
  ): AsyncGenerator<unknown, void, undefined> => {
    const { params = {}, parseAs, ...requestOptions } = options;

    if (parseAs !== undefined) {
      throw new TypeError('The paginate method only supports JSON array responses');
    }

    const query = params.query ?? {};
    const firstPage = query.page === undefined ? 1 : query.page;

    if (typeof firstPage !== 'number' || !Number.isSafeInteger(firstPage) || firstPage < 1) {
      throw new RangeError('The page parameter must be a positive safe integer');
    }

    const pageSize = query.page_size ?? defaultPageSize;

    const iterate = async function* (): AsyncGenerator<unknown, void, undefined> {
      /* eslint-disable-next-line @silverhand/fp/no-let, @silverhand/fp/no-mutation -- Pagination advances one page at a time without retaining prior page responses. */
      for (let page = firstPage; page <= Number.MAX_SAFE_INTEGER; page += 1) {
        // eslint-disable-next-line no-await-in-loop -- Each request depends on the previous response's pagination headers.
        const result = await getPage(path, {
          ...requestOptions,
          params: {
            ...params,
            query: {
              ...query,
              page,
              page_size: pageSize,
            },
          },
        });

        if ('error' in result) {
          throw new ManagementApiPaginationError(result.response, { cause: result.error });
        }

        if (!Array.isArray(result.data)) {
          throw new TypeError('Expected a paginated Management API response to contain an array');
        }

        if (result.data.length === 0) {
          return;
        }

        yield* result.data;

        if (
          !isTotalNumberCapped(result.response.headers) &&
          !hasNextLink(result.response.headers)
        ) {
          return;
        }
      }
    };

    return iterate();
  };

  // eslint-disable-next-line no-restricted-syntax -- The public generic type adds generated path and item types to the runtime iterator.
  return paginate as PaginateMethod<Paths>;
};
