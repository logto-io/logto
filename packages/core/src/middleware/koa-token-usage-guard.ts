import { appInsights } from '@logto/app-insights/node';
import { adminTenantId, ReservedPlanId } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { type MiddlewareType } from 'koa';

import RequestError from '#src/errors/RequestError/index.js';
import { type SubscriptionLibrary } from '#src/libraries/subscription.js';
import assertThat from '#src/utils/assert-that.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

import { getConsoleLogFromContext } from '../utils/console.js';

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
     * The token usage guard is skipped for the admin tenant.
     * This is because the admin tenant has no token limit,
     * and the cloud connection API needs to retrieve the access token for the admin tenant,
     * to make requests to the cloud service. Checking the token usage for the admin tenant
     * will result in an infinite loop.
     */
    if (subscriptionLibrary.tenantId === adminTenantId) {
      return next();
    }

    const consoleLog = getConsoleLogFromContext(ctx);
    consoleLog.plain('Token usage guard', new Date().toISOString());

    try {
      const {
        planId,
        currentPeriodEnd,
        currentPeriodStart,
        quota: { tokenLimit },
      } = await subscriptionLibrary.getSubscriptionData();

      consoleLog.plain('Found subscription data', new Date().toISOString());

      if (!guardedPlanIds.has(planId)) {
        consoleLog.plain('Plan is not guarded, skip token usage guard', new Date().toISOString());
        await next();
        return;
      }

      const tokenUsage = await subscriptionLibrary.getTenantTokenUsage({
        from: new Date(currentPeriodStart),
        to: new Date(currentPeriodEnd),
      });

      consoleLog.plain('Found token usage', new Date().toISOString());

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
