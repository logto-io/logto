import type Router from 'koa-router';
import { LRUCache } from 'lru-cache';
import { type OpenAPIV3 } from 'openapi-types';

import type { AnonymousRouter } from '../types.js';

import {
  assembleSwaggerDocument,
  buildManagementApiBaseDocument,
  getSupplementDocuments,
} from './utils/documents.js';
import { buildRouterObjects, groupRoutesByPath } from './utils/operation.js';

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
  const swaggerDocumentCache = new LRUCache<string, OpenAPIV3.Document>({ max: 32 });

  router.get('/swagger.json', async (ctx, next) => {
    const cacheKey = ctx.request.origin;
    const cachedDocument = swaggerDocumentCache.get(cacheKey);

    if (cachedDocument) {
      ctx.body = cachedDocument;
      return next();
    }

    const supplementDocuments = await supplementDocumentsPromise;
    const baseDocument: OpenAPIV3.Document = buildManagementApiBaseDocument(
      pathMap,
      tags,
      ctx.request.origin
    );

    const data = assembleSwaggerDocument(supplementDocuments, baseDocument, ctx);

    const swaggerDocument = {
      ...data,
      tags: data.tags?.slice().sort((tagA, tagB) => tagA.name.localeCompare(tagB.name)),
    };
    swaggerDocumentCache.set(cacheKey, swaggerDocument);
    ctx.body = swaggerDocument;

    return next();
  });

  const routes = buildRouterObjects([...allRouters, router], { guardCustomRoutes: true });
  const { pathMap, tags } = groupRoutesByPath(routes);
  const supplementDocumentsPromise = getSupplementDocuments('routes', {
    // Exclude interaction routes as they are deprecated.
    excludeDirectories: ['interaction'],
  });
}
