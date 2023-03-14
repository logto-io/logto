import { CloudScope } from '@logto/schemas';
import { createRouter, RequestError } from '@withtyped/server';

import type { ServicesLibrary } from '#src/libraries/services.js';
import type { WithAuthContext } from '#src/middleware/with-auth.js';

export const servicesRoutes = (library: ServicesLibrary) =>
  createRouter<WithAuthContext, '/services'>('/services').post(
    '/send-email',
    {},
    async (context, next) => {
      if (![CloudScope.SendEmail].some((scope) => context.auth.scopes.includes(scope))) {
        throw new RequestError('Forbidden due to lack of permission.', 403);
      }

      const tenantId = await library.getTenantIdFromApplicationId(context.auth.id);

      // TODO send email
      console.log(tenantId);

      return next({ ...context, status: 201 });
    }
  );
