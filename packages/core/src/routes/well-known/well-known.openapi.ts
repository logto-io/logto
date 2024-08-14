import deepmerge from 'deepmerge';
import type Router from 'koa-router';
import { type OpenAPIV3 } from 'openapi-types';

import { EnvSet } from '#src/env-set/index.js';
import {
  getSupplementDocuments,
  isManagementApiRouter,
  normalizePath,
  pruneSwaggerDocument,
  shouldThrow,
  validateSupplement,
  validateSwaggerDocument,
} from '#src/routes/swagger/utils/general.js';
import { customRoutes, throwByDifference } from '#src/routes/swagger/utils/operation-id.js';
import {
  buildExperienceApiBaseDocument,
  buildManagementApiBaseDocument,
  buildOperation,
} from '#src/routes/swagger/utils/operation.js';
import { mergeParameters } from '#src/routes/swagger/utils/parameters.js';
import { type AnonymousRouter } from '#src/routes/types.js';
import { type DeepPartial } from '#src/test-utils/tenant.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnknownRouter = Router<unknown, any>;

type OpenApiRouters<R> = {
  managementRouters: R[];
  experienceRouters: R[];
};

type RouteObject = {
  path: string;
  method: OpenAPIV3.HttpMethods;
  operation: OpenAPIV3.OperationObject;
};

export default function openapiRoutes<T extends AnonymousRouter, R extends UnknownRouter>(
  router: T,
  { managementRouters, experienceRouters }: OpenApiRouters<R>
) {
  router.get('/.well-known/management.openapi.json', async (ctx, next) => {
    /**
     * A set to store all custom routes that have been built.
     * @see {@link customRoutes}
     */
    const builtCustomRoutes = new Set<string>();

    const managementApiRoutes = managementRouters.flatMap<RouteObject>((managementRouter) => {
      const isAuthGuarded = isManagementApiRouter(managementRouter);

      return (
        managementRouter.stack
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
    for (const { path, method, operation } of managementApiRoutes) {
      if (operation.tags) {
        // Collect all tags for sorting
        for (const tag of operation.tags) {
          tags.add(tag);
        }
      }
      pathMap.set(path, { ...pathMap.get(path), [method]: operation });
    }

    // Find supplemental documents
    const supplementDocuments = await getSupplementDocuments('routes', {
      excludeDirectories: ['experience', 'interaction'],
    });

    const baseDocument: OpenAPIV3.Document = buildManagementApiBaseDocument(
      pathMap,
      tags,
      ctx.request.origin
    );

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

  router.get('/.well-known/experience.openapi.json', async (ctx, next) => {
    const experienceApiRoutes = experienceRouters.flatMap<RouteObject>((experienceRouter) => {
      return experienceRouter.stack
        .filter(({ path }) => !path.includes('.*'))
        .flatMap<RouteObject>(({ path: routerPath, stack, methods }) =>
          methods
            .map((method) => method.toLowerCase())
            .filter((method): method is OpenAPIV3.HttpMethods => method !== 'head')
            .map((httpMethod) => {
              const path = normalizePath(routerPath);
              const operation = buildOperation(httpMethod, stack, routerPath, false);

              return {
                path,
                method: httpMethod,
                operation,
              };
            })
        );
    });

    const pathMap = new Map<string, OpenAPIV3.PathItemObject>();
    const tags = new Set<string>();

    // Group routes by path
    for (const { path, method, operation } of experienceApiRoutes) {
      if (operation.tags) {
        // Collect all tags for sorting
        for (const tag of operation.tags) {
          tags.add(tag);
        }
      }
      pathMap.set(path, { ...pathMap.get(path), [method]: operation });
    }

    // Find supplemental documents
    const supplementDocuments = await getSupplementDocuments('routes', {
      includeDirectories: ['experience', 'interaction'],
    });

    const baseDocument = buildExperienceApiBaseDocument(pathMap, tags, ctx.request.origin);

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
