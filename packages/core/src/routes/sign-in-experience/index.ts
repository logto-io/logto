import { DemoConnector } from '@logto/connector-kit';
import { PasswordPolicyChecker } from '@logto/core-kit';
import { ConnectorType, SignInExperiences } from '@logto/schemas';
import { tryThat } from '@silverhand/essentials';
import { literal, object, string, z } from 'zod';

import { validateSignUp, validateSignIn } from '#src/libraries/sign-in-experience/index.js';
import { validateMfa } from '#src/libraries/sign-in-experience/mfa.js';
import koaGuard from '#src/middleware/koa-guard.js';

import RequestError from '../../errors/RequestError/index.js';
import { checkPasswordPolicyForUser } from '../../utils/password.js';
import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

import customUiAssetsRoutes from './custom-ui-assets/index.js';

export default function signInExperiencesRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [router, { queries, libraries, connectors }] = args;
  const { findDefaultSignInExperience, updateDefaultSignInExperience } = queries.signInExperiences;
  const { deleteConnectorById } = queries.connectors;
  const { findUserById } = queries.users;
  const {
    signInExperiences: { validateLanguageInfo },
    quota: { guardTenantUsageByKey, reportSubscriptionUpdatesUsage },
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
        .omit({
          id: true,
          termsOfUseUrl: true,
          privacyPolicyUrl: true,
          supportEmail: true,
          supportWebsiteUrl: true,
          unknownSessionRedirectUrl: true,
        })
        .merge(
          object({
            termsOfUseUrl: string().url().optional().nullable().or(literal('')),
            privacyPolicyUrl: string().url().optional().nullable().or(literal('')),
            supportEmail: string().email().optional().nullable().or(literal('')),
            supportWebsiteUrl: string().url().optional().nullable().or(literal('')),
            unknownSessionRedirectUrl: string().url().optional().nullable().or(literal('')),
          })
        )
        .partial(),
      response: SignInExperiences.guard,
      status: [200, 400, 404, 422],
    }),

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

      if (signIn) {
        const { signUp: signUpSettings } = signUp
          ? { signUp }
          : await findDefaultSignInExperience();
        validateSignIn(signIn, signUpSettings, connectors);
      }

      if (mfa) {
        if (mfa.factors.length > 0) {
          await guardTenantUsageByKey('mfaEnabled');
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

      void reportSubscriptionUpdatesUsage('mfaEnabled');

      return next();
    }
  );

  router.post(
    '/sign-in-exp/default/check-password',
    koaGuard({
      body: z.object({ password: z.string(), userId: z.string().optional() }),
      response: z.object({ result: z.literal(true) }).or(
        z.object({
          result: z.literal(false),
          issues: z.array(
            z.object({ code: z.string(), interpolation: z.record(z.unknown()).optional() })
          ),
        })
      ),
      status: [200, 400],
    }),
    async (ctx, next) => {
      const { password, userId } = ctx.guard.body;
      const [signInExperience, user] = await Promise.all([
        findDefaultSignInExperience(),
        userId && findUserById(userId),
      ]);
      const passwordPolicyChecker = new PasswordPolicyChecker(signInExperience.passwordPolicy);

      const issues = await tryThat(
        async () =>
          user
            ? checkPasswordPolicyForUser(passwordPolicyChecker, password, user)
            : passwordPolicyChecker.check(password),
        (error) => {
          if (error instanceof TypeError) {
            throw new RequestError('request.invalid_input', { message: error.message });
          }
          throw error;
        }
      );

      if (issues.length > 0) {
        ctx.status = 400;
        ctx.body = { result: false, issues };
        return next();
      }

      ctx.body = { result: true };
      return next();
    }
  );

  customUiAssetsRoutes(...args);
}
