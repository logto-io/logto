import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorType } from '@logto/connector-kit';
import { adminConsoleApplicationId } from '@logto/schemas/lib/seeds';
import etag from 'etag';
import type { Provider } from 'oidc-provider';

import { getLogtoConnectors } from '#src/connectors/index.js';
import { getApplicationIdFromInteraction } from '#src/lib/session.js';
import { getSignInExperienceForApplication } from '#src/lib/sign-in-experience/index.js';

import type { AnonymousRouter } from './types.js';

export default function wellKnownRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
  router.get(
    '/.well-known/sign-in-exp',
    async (ctx, next) => {
      const applicationId = await getApplicationIdFromInteraction(ctx, provider);

      const [signInExperience, logtoConnectors] = await Promise.all([
        getSignInExperienceForApplication(applicationId),
        getLogtoConnectors(),
      ]);

      const forgotPassword = {
        sms: logtoConnectors.some(
          ({ type, dbEntry: { enabled } }) => type === ConnectorType.Sms && enabled
        ),
        email: logtoConnectors.some(
          ({ type, dbEntry: { enabled } }) => type === ConnectorType.Email && enabled
        ),
      };

      const socialConnectors =
        applicationId === adminConsoleApplicationId
          ? []
          : signInExperience.socialSignInConnectorTargets.reduce<
              Array<ConnectorMetadata & { id: string }>
            >((previous, connectorTarget) => {
              const connectors = logtoConnectors.filter(
                ({ metadata: { target }, dbEntry: { enabled } }) =>
                  target === connectorTarget && enabled
              );

              return [
                ...previous,
                ...connectors.map(({ metadata, dbEntry: { id } }) => ({ ...metadata, id })),
              ];
            }, []);

      ctx.body = {
        ...signInExperience,
        socialConnectors,
        forgotPassword,
      };

      return next();
    },
    async (ctx, next) => {
      await next();

      ctx.response.etag = etag(JSON.stringify(ctx.body));

      if (ctx.fresh) {
        ctx.status = 304;
        ctx.body = null;
      }
    }
  );
}
