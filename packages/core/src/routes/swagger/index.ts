import type Router from 'koa-router';
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
  router.get('/swagger.json', async (ctx, next) => {
    const routes = buildRouterObjects(allRouters, { guardCustomRoutes: true });
    const { pathMap, tags } = groupRoutesByPath(routes);

    const supplementDocuments = await getSupplementDocuments();

    const baseDocument: OpenAPIV3.Document = buildManagementApiBaseDocument(
      pathMap,
      tags,
      ctx.request.origin
    );

    const data = assembleSwaggerDocument(supplementDocuments, baseDocument, ctx);

    ctx.body = {
      ...data,
      tags: data.tags?.slice().sort((tagA, tagB) => tagA.name.localeCompare(tagB.name)),
    };

    return next();
  });
}
