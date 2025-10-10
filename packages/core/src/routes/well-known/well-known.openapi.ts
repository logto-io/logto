import {
  buildExperienceApiBaseDocument,
  buildManagementApiBaseDocument,
  getSupplementDocuments,
  assembleSwaggerDocument,
  buildUserApiBaseDocument,
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
  userRouters: UnknownRouter[];
};

export default function openapiRoutes<T extends AnonymousRouter, R extends UnknownRouter>(
  router: T,
  { managementRouters, experienceRouters, userRouters }: OpenApiRouters<R>
) {
  router.get('/.well-known/management.openapi.json', async (ctx, next) => {
    const managementApiRoutes = buildRouterObjects(managementRouters, {
      guardCustomRoutes: true,
    });

    const { pathMap, tags } = groupRoutesByPath(managementApiRoutes);

    // Find supplemental documents
    const supplementDocuments = await getSupplementDocuments('routes', {
      excludeDirectories: ['experience', 'interaction', 'account', 'verification'],
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
      includeDirectories: ['experience'],
    });
    const baseDocument = buildExperienceApiBaseDocument(pathMap, tags, ctx.request.origin);

    const data = assembleSwaggerDocument(supplementDocuments, baseDocument, ctx);

    ctx.body = {
      ...data,
      tags: data.tags?.slice().sort((tagA, tagB) => tagA.name.localeCompare(tagB.name)),
    };

    return next();
  });

  router.get('/.well-known/user.openapi.json', async (ctx, next) => {
    const userApiRoutes = buildRouterObjects(userRouters);
    const { pathMap, tags } = groupRoutesByPath(userApiRoutes);

    // Find supplemental documents
    const supplementDocuments = await getSupplementDocuments('routes', {
      includeDirectories: ['account', 'verification'],
    });
    const baseDocument = buildUserApiBaseDocument(pathMap, tags, ctx.request.origin);

    const data = assembleSwaggerDocument(supplementDocuments, baseDocument, ctx);

    ctx.body = {
      ...data,
      tags: data.tags?.slice().sort((tagA, tagB) => tagA.name.localeCompare(tagB.name)),
    };

    return next();
  });
}
