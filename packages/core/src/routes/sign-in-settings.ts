import { ConnectorMetadata } from '@logto/connector-types';
import { SignInMode } from '@logto/schemas';
import { adminConsoleApplicationId, adminConsoleSignInMethods } from '@logto/schemas/lib/seeds';
import etag from 'etag';
import { Provider } from 'oidc-provider';

import { getConnectorInstances } from '@/connectors';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';
import { hasActiveUsers } from '@/queries/user';

import { AnonymousRouter } from './types';

export default function signInSettingsRoutes<T extends AnonymousRouter>(
  router: T,
  provider: Provider
) {
  router.get(
    '/sign-in-settings',
    async (ctx, next) => {
      const [signInExperience, connectorInstances, interaction] = await Promise.all([
        findDefaultSignInExperience(),
        getConnectorInstances(),
        provider.interactionDetails(ctx.req, ctx.res),
      ]);

      const socialConnectors = signInExperience.socialSignInConnectorTargets.reduce<
        Array<ConnectorMetadata & { id: string }>
      >((previous, connectorTarget) => {
        const connectors = connectorInstances.filter(
          ({ metadata: { target }, connector: { enabled } }) =>
            target === connectorTarget && enabled
        );

        return [
          ...previous,
          ...connectors.map(({ metadata, connector: { id } }) => ({ ...metadata, id })),
        ];
      }, []);

      const {
        params: { client_id },
      } = interaction;

      // Hard code AdminConsole sign-in methods settings.
      if (client_id === adminConsoleApplicationId) {
        ctx.body = {
          ...signInExperience,
          signInMethods: adminConsoleSignInMethods,
          signInMode: (await hasActiveUsers()) ? SignInMode.SignIn : SignInMode.Register,
          socialConnectors: [],
        };

        return next();
      }

      ctx.body = { ...signInExperience, socialConnectors };

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
