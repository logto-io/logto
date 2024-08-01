import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { httpCodeToMessage } from '@logto/core-kit';
import { cond, condArray, condString, conditionalArray, deduplicate } from '@silverhand/essentials';
import deepmerge from 'deepmerge';
import { findUp } from 'find-up';
import type { IMiddleware } from 'koa-router';
import type Router from 'koa-router';
import { type OpenAPIV3 } from 'openapi-types';

import { EnvSet } from '#src/env-set/index.js';
import { isKoaAuthMiddleware } from '#src/middleware/koa-auth/index.js';
import type { WithGuardConfig } from '#src/middleware/koa-guard.js';
import { isGuardMiddleware } from '#src/middleware/koa-guard.js';
import { isPaginationMiddleware } from '#src/middleware/koa-pagination.js';
import { type DeepPartial } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { translationSchemas, zodTypeToSwagger } from '#src/utils/zod.js';

import type { AnonymousRouter } from '../types.js';

import { managementApiAuthDescription } from './consts.js';
import {
  buildTag,
  devFeatureTag,
  findSupplementFiles,
  normalizePath,
  pruneSwaggerDocument,
  removeUnnecessaryOperations,
  shouldThrow,
  validateSupplement,
  validateSwaggerDocument,
} from './utils/general.js';
import { buildOperationId, customRoutes, throwByDifference } from './utils/operation-id.js';
import {
  buildParameters,
  paginationParameters,
  searchParameters,
  buildPathIdParameters,
  mergeParameters,
  customParameters,
} from './utils/parameters.js';

const anonymousPaths = new Set<string>([
  'interaction',
  '.well-known',
  'authn',
  'swagger.json',
  'status',
]);

const advancedSearchPaths = new Set<string>([
  '/applications',
  '/applications/:applicationId/roles',
  '/resources/:resourceId/scopes',
  '/roles/:id/applications',
  '/roles/:id/scopes',
  '/roles',
  '/roles/:id/users',
  '/users',
  '/users/:userId/roles',
]);

type RouteObject = {
  path: string;
  method: OpenAPIV3.HttpMethods;
  operation: OpenAPIV3.OperationObject;
};

// eslint-disable-next-line complexity
const buildOperation = (
  method: OpenAPIV3.HttpMethods,
  stack: IMiddleware[],
  path: string,
  isAuthGuarded: boolean
): OpenAPIV3.OperationObject => {
  const guard = stack.find((function_): function_ is WithGuardConfig<IMiddleware> =>
    isGuardMiddleware(function_)
  );
  const { params, query, body, response, status } = guard?.config ?? {};
  const pathParameters = buildParameters(params, 'path', path);

  const hasPagination = stack.some((function_) => isPaginationMiddleware(function_));
  const queryParameters = [
    ...buildParameters(query, 'query'),
    ...(hasPagination ? paginationParameters : []),
    ...(advancedSearchPaths.has(path) && method === 'get' ? [searchParameters] : []),
  ];

  const requestBody = body && {
    required: true,
    content: {
      'application/json': {
        schema: zodTypeToSwagger(body),
      },
    },
  };

  const hasInputGuard = Boolean(params ?? query ?? body);
  const responses: OpenAPIV3.ResponsesObject = Object.fromEntries(
    deduplicate(
      conditionalArray(status ?? 200, hasInputGuard && 400, isAuthGuarded && [401, 403])
    ).map<[number, OpenAPIV3.ResponseObject]>((status) => {
      const description = httpCodeToMessage[status];

      if (!description) {
        throw new Error(`Invalid status code ${status}.`);
      }

      if (status === 200 || status === 201) {
        return [
          status,
          {
            description,
            content: {
              'application/json': {
                schema: response && zodTypeToSwagger(response),
              },
            },
          },
        ];
      }

      return [status, { description }];
    })
  );

  const [firstSegment] = path.split('/').slice(1);

  return {
    operationId: buildOperationId(method, path),
    tags: [buildTag(path)],
    parameters: [...pathParameters, ...queryParameters],
    requestBody,
    responses,
    security: cond(firstSegment && anonymousPaths.has(firstSegment) && []),
  };
};

const isManagementApiRouter = ({ stack }: Router) =>
  stack
    .filter(({ path }) => !path.includes('.*'))
    .some(({ stack }) => stack.some((function_) => isKoaAuthMiddleware(function_)));

// Add more components here to cover more ID parameters in paths. For example, if there is a
// path `/foo/:barBazId`, then add `bar-baz` to the array.
const identifiableEntityNames = Object.freeze([
  'key',
  'connector-factory',
  'factory',
  'application',
  'connector',
  'sso-connector',
  'resource',
  'user',
  'log',
  'role',
  'scope',
  'hook',
  'domain',
  'verification',
  'organization',
  'organization-role',
  'organization-scope',
  'organization-invitation',
]);

/** Additional tags that cannot be inferred from the path. */
const additionalTags = Object.freeze(
  condArray<string>(
    'Organization applications',
    EnvSet.values.isDevFeaturesEnabled && 'Custom UI assets',
    'Organization users'
  )
);

/**
 * Attach the `/swagger.json` route which returns the generated OpenAPI document for the
 * management APIs.
 *
 * @param router The router to attach the route to.
 * @param allRouters All management API routers. This is used to generate the OpenAPI document.
 */
// Keep using `any` to accept various custom context types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function swaggerRoutes<T extends AnonymousRouter, R extends Router<unknown, any>>(
  router: T,
  allRouters: R[]
) {
  router.get('/swagger.json', async (ctx, next) => {
    /**
     * A set to store all custom routes that have been built.
     * @see {@link customRoutes}
     */
    const builtCustomRoutes = new Set<string>();

    const routes = allRouters.flatMap<RouteObject>((router) => {
      const isAuthGuarded = isManagementApiRouter(router);

      return (
        router.stack
          // Filter out universal routes (mostly like a proxy route to withtyped)
          .filter(({ path }) => !path.includes('.*'))
          .flatMap<RouteObject>(({ path: routerPath, stack, methods }) =>
            methods
              .map((method) => method.toLowerCase())
              // There is no need to show the HEAD method.
              .filter((method): method is OpenAPIV3.HttpMethods => method !== 'head')
              .map((httpMethod) => {
                const path = normalizePath(routerPath);
                const operation = buildOperation(httpMethod, stack, routerPath, isAuthGuarded);

                if (customRoutes[`${httpMethod} ${routerPath}`]) {
                  builtCustomRoutes.add(`${httpMethod} ${routerPath}`);
                }

                return {
                  path,
                  method: httpMethod,
                  operation,
                };
              })
          )
      );
    });

    // Ensure all custom routes are built.
    throwByDifference(builtCustomRoutes);

    const pathMap = new Map<string, OpenAPIV3.PathItemObject>();
    const tags = new Set<string>();

    // Group routes by path
    for (const { path, method, operation } of routes) {
      if (operation.tags) {
        // Collect all tags for sorting
        for (const tag of operation.tags) {
          tags.add(tag);
        }
      }
      pathMap.set(path, { ...pathMap.get(path), [method]: operation });
    }

    const routesDirectory = await findUp('routes', {
      type: 'directory',
      cwd: fileURLToPath(import.meta.url),
    });
    assertThat(routesDirectory, new Error('Cannot find routes directory.'));

    const supplementPaths = await findSupplementFiles(routesDirectory);
    const allSupplementDocuments = await Promise.all(
      supplementPaths.map(async (path) =>
        removeUnnecessaryOperations(
          // eslint-disable-next-line no-restricted-syntax -- trust the type here as we'll validate it later
          JSON.parse(await fs.readFile(path, 'utf8')) as DeepPartial<OpenAPIV3.Document>
        )
      )
    );

    // Filter out supplement documents that are for dev features when dev features are disabled.
    const supplementDocuments = allSupplementDocuments.filter(
      (supplement) =>
        EnvSet.values.isDevFeaturesEnabled ||
        !supplement.tags?.find((tag) => tag?.name === devFeatureTag)
    );

    const baseDocument: OpenAPIV3.Document = {
      openapi: '3.0.1',
      servers: [
        {
          url: EnvSet.values.isCloud ? 'https://[tenant_id].logto.app/' : ctx.request.origin,
          description: 'Logto endpoint address.',
        },
      ],
      info: {
        title: 'Logto API references',
        description:
          'API references for Logto services.' +
          condString(
            EnvSet.values.isCloud &&
              '\n\nNote: The documentation is for Logto Cloud. If you are using Logto OSS, please refer to the response of `/api/swagger.json` endpoint on your Logto instance.'
          ),
        version: 'Cloud',
      },
      paths: Object.fromEntries(pathMap),
      security: [{ OAuth2: ['all'] }],
      components: {
        securitySchemes: {
          OAuth2: {
            type: 'oauth2',
            description: managementApiAuthDescription,
            flows: {
              clientCredentials: {
                tokenUrl: '/oidc/token',
                scopes: {
                  all: 'All scopes',
                },
              },
            },
          },
        },
        schemas: translationSchemas,
        parameters: identifiableEntityNames.reduce(
          (previous, entityName) => ({
            ...previous,
            ...buildPathIdParameters(entityName),
          }),
          customParameters()
        ),
      },
      tags: [...tags, ...additionalTags].map((tag) => ({ name: tag })),
    };

    const data = supplementDocuments.reduce<OpenAPIV3.Document>(
      (document, supplement) =>
        deepmerge<OpenAPIV3.Document, DeepPartial<OpenAPIV3.Document>>(document, supplement, {
          arrayMerge: mergeParameters,
        }),
      baseDocument
    );

    pruneSwaggerDocument(data);

    if (EnvSet.values.isUnitTest) {
      getConsoleLogFromContext(ctx).warn('Skip validating swagger document in unit test.');
    }
    // Don't throw for integrity check in production as it has no benefit.
    else if (shouldThrow()) {
      for (const document of supplementDocuments) {
        validateSupplement(baseDocument, document);
      }
      validateSwaggerDocument(data);
    }

    ctx.body = {
      ...data,
      tags: data.tags?.slice().sort((tagA, tagB) => tagA.name.localeCompare(tagB.name)),
    };

    return next();
  });
}
