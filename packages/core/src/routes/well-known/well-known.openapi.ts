import {
  buildExperienceApiBaseDocument,
  buildManagementApiBaseDocument,
  getSupplementDocuments,
  assembleSwaggerDocument,
} from '#src/routes/swagger/utils/documents.js';
import {
  buildRouterObjects,
  groupRoutesByPath,
  type UnknownRouter,
} from '#src/routes/swagger/utils/operation.js';
import { type AnonymousRouter } from '#src/routes/types.js';

type OpenApiRouters<R> = {
  managementRouters: R[];
  experienceRouters: R[];
};

export default function openapiRoutes<T extends AnonymousRouter, R extends UnknownRouter>(
  router: T,
  { managementRouters, experienceRouters }: OpenApiRouters<R>
) {
  router.get('/.well-known/management.openapi.json', async (ctx, next) => {
    const managementApiRoutes = buildRouterObjects(managementRouters, {
      guardCustomRoutes: true,
    });

    const { pathMap, tags } = groupRoutesByPath(managementApiRoutes);

    // Find supplemental documents
    const supplementDocuments = await getSupplementDocuments('routes', {
      excludeDirectories: ['experience', 'interaction'],
    });
    const baseDocument = buildManagementApiBaseDocument(pathMap, tags, ctx.request.origin);

    const data = assembleSwaggerDocument(supplementDocuments, baseDocument, ctx);

    ctx.body = {
      ...data,
      tags: data.tags?.slice().sort((tagA, tagB) => tagA.name.localeCompare(tagB.name)),
    };

    return next();
  });

  router.get('/.well-known/experience.openapi.json', async (ctx, next) => {
    const experienceApiRoutes = buildRouterObjects(experienceRouters);
    const { pathMap, tags } = groupRoutesByPath(experienceApiRoutes);

    // Find supplemental documents
    const supplementDocuments = await getSupplementDocuments('routes', {
      includeDirectories: ['experience', 'interaction'],
    });
    const baseDocument = buildExperienceApiBaseDocument(pathMap, tags, ctx.request.origin);

    const data = assembleSwaggerDocument(supplementDocuments, baseDocument, ctx);

    ctx.body = {
      ...data,
      tags: data.tags?.slice().sort((tagA, tagB) => tagA.name.localeCompare(tagB.name)),
    };

    return next();
  });
}
