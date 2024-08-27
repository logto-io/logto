import { DemoConnector } from '@logto/connector-kit';
import { ConnectorType, SignInExperiences } from '@logto/schemas';
import { literal, object, string, z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import { validateSignUp, validateSignIn } from '#src/libraries/sign-in-experience/index.js';
import { validateMfa } from '#src/libraries/sign-in-experience/mfa.js';
import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

import customUiAssetsRoutes from './custom-ui-assets/index.js';

export default function signInExperiencesRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [router, { queries, libraries, connectors }] = args;
  const { findDefaultSignInExperience, updateDefaultSignInExperience } = queries.signInExperiences;
  const { deleteConnectorById } = queries.connectors;
  const {
    signInExperiences: { validateLanguageInfo },
    quota: { guardKey, guardTenantUsageByKey },
  } = libraries;
  const { getLogtoConnectors } = connectors;

  /**
   * As we only support single signInExperience settings for V1
   * always return the default settings in DB for the /sign-in-exp get method
   */
  router.get(
    '/sign-in-exp',
    koaGuard({
      response: SignInExperiences.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      ctx.body = await findDefaultSignInExperience();

      return next();
    }
  );

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
      response: SignInExperiences.guard,
      status: [200, 400, 404, 422],
    }),
    // eslint-disable-next-line complexity
    async (ctx, next) => {
      const {
        query: { removeUnusedDemoSocialConnector },
        body: { socialSignInConnectorTargets, ...rest },
      } = ctx.guard;
      const { languageInfo, signUp, signIn, mfa } = rest;

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

      if (mfa) {
        if (mfa.factors.length > 0) {
          await (EnvSet.values.isDevFeaturesEnabled
            ? guardTenantUsageByKey('mfaEnabled')
            : guardKey('mfaEnabled'));
        }
        validateMfa(mfa);
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

  customUiAssetsRoutes(...args);
}
