import { ConnectorType, SignInExperiences } from '@logto/schemas';
import { DemoConnector } from '@logto/shared';
import { literal, object, string, z } from 'zod';

import { validateSignUp, validateSignIn } from '#src/libraries/sign-in-experience/index.js';
import koaGuard from '#src/middleware/koa-guard.js';

import type { AuthedRouter, RouterInitArgs } from '../types.js';

export default function signInExperiencesRoutes<T extends AuthedRouter>(
  ...[router, { queries, libraries, connectors }]: RouterInitArgs<T>
) {
  const { findDefaultSignInExperience, updateDefaultSignInExperience } = queries.signInExperiences;
  const { deleteConnectorById } = queries.connectors;
  const {
    signInExperiences: { validateLanguageInfo },
  } = libraries;
  const { getLogtoConnectors } = connectors;

  /**
   * As we only support single signInExperience settings for V1
   * always return the default settings in DB for the /sign-in-exp get method
   */
  router.get('/sign-in-exp', async (ctx, next) => {
    ctx.body = await findDefaultSignInExperience();

    return next();
  });

  router.patch(
    '/sign-in-exp',
    koaGuard({
      query: z.object({ removeUnusedDemoSocialConnector: z.string().optional() }),
      body: SignInExperiences.createGuard
        .omit({ id: true, termsOfUseUrl: true, privacyPolicyUrl: true })
        .merge(
          object({
            termsOfUseUrl: string().url().optional().nullable().or(literal('')),
            privacyPolicyUrl: string().url().optional().nullable().or(literal('')),
          })
        )
        .partial(),
    }),
    async (ctx, next) => {
      const {
        query: { removeUnusedDemoSocialConnector },
        body: { socialSignInConnectorTargets, ...rest },
      } = ctx.guard;
      const { languageInfo, signUp, signIn } = rest;

      if (languageInfo) {
        await validateLanguageInfo(languageInfo);
      }

      const connectors = await getLogtoConnectors();

      // Remove unavailable connectors
      const filteredSocialSignInConnectorTargets = socialSignInConnectorTargets?.filter((target) =>
        connectors.some(
          (connector) =>
            connector.metadata.target === target && connector.type === ConnectorType.Social
        )
      );

      if (signUp) {
        validateSignUp(signUp, connectors);
      }

      if (signIn && signUp) {
        validateSignIn(signIn, signUp, connectors);
      } else if (signIn) {
        const signInExperience = await findDefaultSignInExperience();
        validateSignIn(signIn, signInExperience.signUp, connectors);
      }

      // Remove unused demo social connectors, those that are not selected in onboarding SIE config.
      if (removeUnusedDemoSocialConnector && filteredSocialSignInConnectorTargets) {
        await Promise.all(
          connectors
            .filter((connector) => {
              return (
                connector.type === ConnectorType.Social &&
                connector.metadata.id === DemoConnector.Social &&
                !filteredSocialSignInConnectorTargets.includes(connector.metadata.target)
              );
            })
            .map(async (connector) => deleteConnectorById(connector.dbEntry.id))
        );
      }

      ctx.body = await updateDefaultSignInExperience(
        filteredSocialSignInConnectorTargets
          ? {
              ...rest,
              socialSignInConnectorTargets: filteredSocialSignInConnectorTargets,
            }
          : rest
      );

      return next();
    }
  );
}
