import { ConnectorType, sendMessagePayloadGuard } from '@logto/connector-kit';
import { CloudScope, ServiceLogType } from '@logto/schemas';
import { createRouter, RequestError } from '@withtyped/server';
import { z } from 'zod';

import type { ServicesLibrary } from '#src/libraries/services.js';
import type { WithAuthContext } from '#src/middleware/with-auth.js';

export const servicesRoutes = (library: ServicesLibrary) =>
  createRouter<WithAuthContext, '/services'>('/services')
    .post(
      '/send-email',
      { body: z.object({ data: sendMessagePayloadGuard }) },
      async (context, next) => {
        if (![CloudScope.SendEmail].some((scope) => context.auth.scopes.includes(scope))) {
          throw new RequestError('Forbidden due to lack of permission.', 403);
        }

        const tenantId = await library.getTenantIdFromApplicationId(context.auth.id);

        if (!tenantId) {
          throw new RequestError('Unable to find tenant id.', 403);
        }

        const balance = await library.getTenantBalanceForType(tenantId, ServiceLogType.SendEmail);

        if (!balance) {
          throw new RequestError('Service usage limit reached.', 403);
        }

        await library.sendMessage(ConnectorType.Email, context.guarded.body.data);
        await library.addLog(tenantId, ServiceLogType.SendEmail);

        return next({ ...context, status: 201 });
      }
    )
    .post(
      '/send-sms',
      { body: z.object({ data: sendMessagePayloadGuard }) },
      async (context, next) => {
        if (![CloudScope.SendSms].some((scope) => context.auth.scopes.includes(scope))) {
          throw new RequestError('Forbidden due to lack of permission.', 403);
        }

        const tenantId = await library.getTenantIdFromApplicationId(context.auth.id);

        if (!tenantId) {
          throw new RequestError('Unable to find tenant id.', 403);
        }

        const balance = await library.getTenantBalanceForType(tenantId, ServiceLogType.SendSms);

        if (!balance) {
          throw new RequestError('Service usage limit reached.', 403);
        }

        await library.sendMessage(ConnectorType.Sms, context.guarded.body.data);
        await library.addLog(tenantId, ServiceLogType.SendSms);

        return next({ ...context, status: 201 });
      }
    );
