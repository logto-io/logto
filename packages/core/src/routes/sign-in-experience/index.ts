import { DemoConnector } from '@logto/connector-kit';
import { PasswordPolicyChecker } from '@logto/core-kit';
import {
  ConnectorType,
  SignInExperiences,
  ForgotPasswordMethod,
  ProductEvent,
  type SignInExperience,
} from '@logto/schemas';
import { conditional, type Optional, tryThat } from '@silverhand/essentials';
import { literal, object, string, z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import {
  validateSignUp,
  validateSignIn,
  parseEmailBlocklistPolicy,
  isEmailBlocklistPolicyEnabled,
} from '#src/libraries/sign-in-experience/index.js';
import { validateMfa } from '#src/libraries/sign-in-experience/mfa.js';
import koaGuard from '#src/middleware/koa-guard.js';

import RequestError from '../../errors/RequestError/index.js';
import assertThat from '../../utils/assert-that.js';
import { checkPasswordPolicyForUser } from '../../utils/password.js';
import { captureEvent } from '../../utils/posthog.js';
import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

import customUiAssetsRoutes from './custom-ui-assets/index.js';

const isMfaEnabled = (mfa: Optional<SignInExperience['mfa']>): boolean =>
  Boolean(mfa?.factors && mfa.factors.length > 0);

export default function signInExperiencesRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [router, { id: tenantId, queries, libraries, connectors }] = args;
  const { findDefaultSignInExperience, updateDefaultSignInExperience } = queries.signInExperiences;
  const { deleteConnectorById } = queries.connectors;
  const { findUserById } = queries.users;
  const {
    signInExperiences: { validateLanguageInfo },
    quota,
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
      status: [200, 400, 404, 422, 403],
    }),

    // eslint-disable-next-line complexity
    async (ctx, next) => {
      const {
        query: { removeUnusedDemoSocialConnector },
        body: { socialSignInConnectorTargets, emailBlocklistPolicy, ...rest },
      } = ctx.guard;
      const {
        languageInfo,
        signUp,
        signIn,
        mfa,
        sentinelPolicy,
        captchaPolicy,
        forgotPasswordMethods,
        hideLogtoBranding,
      } = rest;

      if (languageInfo) {
        await validateLanguageInfo(languageInfo);
      }

      const [connectors, currentSettings] = await Promise.all([
        getLogtoConnectors(),
        findDefaultSignInExperience(),
      ]);

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
        const { signUp: signUpSettings } = signUp ? { signUp } : currentSettings;
        const { mfa: currentMfa } = mfa ? { mfa } : currentSettings;
        validateSignIn(signIn, signUpSettings, connectors, currentMfa);
      }

      if (mfa) {
        if (isMfaEnabled(mfa)) {
          await quota.guardTenantUsageByKey('mfaEnabled');
        }
        // Get the current sign-in configuration
        const { signIn: currentSignIn } = signIn ? { signIn } : currentSettings;
        validateMfa(mfa, currentSignIn);
      }

      if (forgotPasswordMethods) {
        const hasEmailConnector = connectors.some(({ type }) => type === ConnectorType.Email);
        const hasSmsConnector = connectors.some(({ type }) => type === ConnectorType.Sms);

        for (const method of forgotPasswordMethods) {
          if (method === ForgotPasswordMethod.EmailVerificationCode && !hasEmailConnector) {
            throw new RequestError({
              code: 'sign_in_experiences.forgot_password_method_requires_connector',
              method: 'email',
            });
          }
          if (method === ForgotPasswordMethod.PhoneVerificationCode && !hasSmsConnector) {
            throw new RequestError({
              code: 'sign_in_experiences.forgot_password_method_requires_connector',
              method: 'sms',
            });
          }
        }
      }

      /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
      // Guard the quota for the security features enabled. Guarded properties are:
      // - sentinelPolicy: if sentinelPolicy is not empty object, security features are guarded
      // - captchaPolicy: if captchaPolicy is enabled, security features are guarded
      // - emailBlocklistPolicy: if any of the blocklist policies are enabled, security features are guarded
      if (
        (sentinelPolicy && Object.keys(sentinelPolicy).length > 0) ||
        (emailBlocklistPolicy && isEmailBlocklistPolicyEnabled(emailBlocklistPolicy)) ||
        captchaPolicy?.enabled
      ) {
        await quota.guardTenantUsageByKey('securityFeaturesEnabled');
      }
      /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */

      if (removeUnusedDemoSocialConnector && filteredSocialSignInConnectorTargets) {
        // Remove unused demo social connectors, those that are not selected in onboarding SIE config.
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

      // Guard the quota for BYUI if the hideLogtoBranding is set to true
      if (hideLogtoBranding) {
        // Hide Logto branding is only available for Logto Cloud
        assertThat(
          EnvSet.values.isCloud,
          new RequestError({
            code: 'request.invalid_input',
            details: 'Hide Logto branding is not supported in this environment',
          })
        );
        await quota.guardTenantUsageByKey('bringYourUiEnabled');
      }

      const payload = {
        ...rest,
        ...conditional(
          filteredSocialSignInConnectorTargets && {
            socialSignInConnectorTargets: filteredSocialSignInConnectorTargets,
          }
        ),
        ...conditional(
          emailBlocklistPolicy && {
            emailBlocklistPolicy: parseEmailBlocklistPolicy(emailBlocklistPolicy),
          }
        ),
      };

      ctx.body = await updateDefaultSignInExperience(payload);

      void quota.reportSubscriptionUpdatesUsage('mfaEnabled');

      if (sentinelPolicy ?? captchaPolicy ?? emailBlocklistPolicy) {
        void quota.reportSubscriptionUpdatesUsage('securityFeaturesEnabled');
      }

      // Only capture the event when MFA status changes
      if (isMfaEnabled(currentSettings.mfa) !== isMfaEnabled(mfa)) {
        captureEvent(
          { tenantId, request: ctx.req },
          isMfaEnabled(mfa) ? ProductEvent.MfaEnabled : ProductEvent.MfaDisabled
        );
      }
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
