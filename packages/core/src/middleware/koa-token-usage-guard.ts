import { appInsights } from '@logto/app-insights/node';
import { adminTenantId, ReservedPlanId } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { type MiddlewareType } from 'koa';

import RequestError from '#src/errors/RequestError/index.js';
import { type SubscriptionLibrary } from '#src/libraries/subscription.js';
import assertThat from '#src/utils/assert-that.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

const guardedPlanIds = new Set<string>([ReservedPlanId.Free, ReservedPlanId.Development]);

/**
 * This middleware will be applied to the /token endpoint to validate the current tenant's token usage.
 * If the tenant has exceeded the token usage, the middleware will reject the request.
 */
export default function koaTokenUsageGuard<StateT, ContextT, ResponseBodyT>(
  subscriptionLibrary: SubscriptionLibrary
): MiddlewareType<StateT, ContextT, Nullable<ResponseBodyT>> {
  return async (ctx, next) => {
    const { path } = ctx;

    if (path !== '/token') {
      return next();
    }

    /**
     * Skip the token usage guard for the admin tenant.
     *
     * Notice:
     * We need to skip the subscription check for the admin tenant.
     * Not only because there is no token usage limit for the admin tenant,
     * but also because cloud connection API need to retrieve the access token from the admin tenant,
     * in order to make the request to the cloud service.
     * Otherwise it will cause an infinite loop.
     */
    if (subscriptionLibrary.tenantId === adminTenantId) {
      return next();
    }

    try {
      const {
        planId,
        currentPeriodEnd,
        currentPeriodStart,
        quota: { tokenLimit },
      } = await subscriptionLibrary.getSubscriptionData();

      if (!guardedPlanIds.has(planId)) {
        await next();
        return;
      }

      const tokenUsage = await subscriptionLibrary.getTenantTokenUsage({
        from: new Date(currentPeriodStart),
        to: new Date(currentPeriodEnd),
      });

      assertThat(
        tokenLimit === null || tokenUsage < tokenLimit,
        new RequestError({
          code: 'auth.exceed_token_limit',
          status: 429,
        })
      );
    } catch (error: unknown) {
      if (error instanceof RequestError) {
        throw error;
      }

      // Incase of any unexpected error, track it to App Insights and continue the request.
      // Should not block the end-user's request for any unexpected error.
      void appInsights.trackException(error, buildAppInsightsTelemetry(ctx));
    }

    return next();
  };
}
