import type { ConnectorMetadata } from '@logto/connector-kit';
import { SignInMode } from '@logto/schemas';
import {
  adminConsoleApplicationId,
  adminConsoleSignInExperience,
  demoAppApplicationId,
} from '@logto/schemas/lib/seeds';
import etag from 'etag';
import i18next from 'i18next';
import type { Provider } from 'oidc-provider';
import { errors } from 'oidc-provider';

import { getLogtoConnectors } from '@/connectors';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';
import { hasActiveUsers } from '@/queries/user';

import type { AnonymousRouter } from './types';

export default function wellKnownRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
  router.get(
    '/.well-known/sign-in-exp',
    async (ctx, next) => {
      const interaction = await provider
        .interactionDetails(ctx.req, ctx.res)
        .catch((error: unknown) => {
          // Should not block if interaction is not found
          if (error instanceof errors.SessionNotFound) {
            return null;
          }

          throw error;
        });

      const [signInExperience, logtoConnectors] = await Promise.all([
        findDefaultSignInExperience(),
        getLogtoConnectors(),
      ]);

      // Hard code AdminConsole sign-in methods settings.
      if (interaction?.params.client_id === adminConsoleApplicationId) {
        ctx.body = {
          ...adminConsoleSignInExperience,
          branding: {
            ...adminConsoleSignInExperience.branding,
            slogan: i18next.t('admin_console.welcome.title'),
          },
          languageInfo: signInExperience.languageInfo,
          signInMode: (await hasActiveUsers()) ? SignInMode.SignIn : SignInMode.Register,
          socialConnectors: [],
        };

        return next();
      }

      // Custom Applications

      const socialConnectors = signInExperience.socialSignInConnectorTargets.reduce<
        Array<ConnectorMetadata & { id: string }>
      >((previous, connectorTarget) => {
        const connectors = logtoConnectors.filter(
          ({ metadata: { target }, dbEntry: { enabled } }) => target === connectorTarget && enabled
        );

        return [
          ...previous,
          ...connectors.map(({ metadata, dbEntry: { id } }) => ({ ...metadata, id })),
        ];
      }, []);

      // Insert Demo App Notification
      if (interaction?.params.client_id === demoAppApplicationId) {
        const {
          languageInfo: { autoDetect, fallbackLanguage },
        } = signInExperience;

        ctx.body = {
          ...signInExperience,
          socialConnectors,
          notification: i18next.t(
            'demo_app.notification',
            autoDetect ? undefined : { lng: fallbackLanguage }
          ),
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
