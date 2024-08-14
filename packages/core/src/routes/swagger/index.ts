import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import deepmerge from 'deepmerge';
import { findUp } from 'find-up';
import type Router from 'koa-router';
import { type OpenAPIV3 } from 'openapi-types';

import { EnvSet } from '#src/env-set/index.js';
import { type DeepPartial } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import type { AnonymousRouter } from '../types.js';

import {
  devFeatureTag,
  findSupplementFiles,
  isManagementApiRouter,
  normalizePath,
  pruneSwaggerDocument,
  removeUnnecessaryOperations,
  shouldThrow,
  validateSupplement,
  validateSwaggerDocument,
} from './utils/general.js';
import { customRoutes, throwByDifference } from './utils/operation-id.js';
import { buildManagementApiBaseDocument, buildOperation } from './utils/operation.js';
import { mergeParameters } from './utils/parameters.js';

type RouteObject = {
  path: string;
  method: OpenAPIV3.HttpMethods;
  operation: OpenAPIV3.OperationObject;
};

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
}
