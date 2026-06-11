/* eslint-disable max-lines -- This route module already hosts several Sign-in Experience endpoints; keep this API change colocated with the existing update flow. */
import { DemoConnector } from '@logto/connector-kit';
import { PasswordPolicyChecker } from '@logto/core-kit';
import {
  ConnectorType,
  SignInExperiences,
  MfaPolicy,
  ProductEvent,
  type SignInExperience,
  ForgotPasswordMethod,
  passwordExpirationPolicyGuard,
  verificationCodePolicyGuard,
} from '@logto/schemas';
import { conditional, type Optional, tryThat } from '@silverhand/essentials';
import { literal, object, string, z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import {
  getForgotPasswordAvailability,
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
import { hasCustomUiCspSources, normalizeCustomUiCsp } from './custom-ui-csp.js';
import usernamePolicyRoutes from './username-policy.js';

const isMfaEnabled = (mfa: Optional<SignInExperience['mfa']>): boolean =>
  Boolean(mfa?.factors && mfa.factors.length > 0);

const isNonSkippableMfaPromptPolicy = (policy: MfaPolicy) =>
  [MfaPolicy.PromptAtSignInAndSignUpMandatory, MfaPolicy.PromptOnlyAtSignInMandatory].includes(
    policy
  );

const signInExperienceResponseGuard = SignInExperiences.guard;
const signInExperienceCreateGuard = SignInExperiences.createGuard;

export default function signInExperiencesRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [router, { id: tenantId, queries, libraries, connectors }] = args;
  const { findDefaultSignInExperience, updateDefaultSignInExperience } = queries.signInExperiences;
  const { deleteConnectorById } = queries.connectors;
  const { findUserById } = queries.users;
  const { normalizeProfileFields } = libraries.customProfileFields;
  const {
    signInExperiences: { validateLanguageInfo, findCaseConflicts },
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
      response: signInExperienceResponseGuard,
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
      body: signInExperienceCreateGuard
        .omit({
          id: true,
          termsOfUseUrl: true,
          privacyPolicyUrl: true,
          supportEmail: true,
          supportWebsiteUrl: true,
          unknownSessionRedirectUrl: true,
          passwordExpiration: true,
          verificationCodePolicy: true,
        })
        .merge(
          object({
            termsOfUseUrl: string().url().optional().nullable().or(literal('')),
            privacyPolicyUrl: string().url().optional().nullable().or(literal('')),
            supportEmail: string().email().optional().nullable().or(literal('')),
            supportWebsiteUrl: string().url().optional().nullable().or(literal('')),
            unknownSessionRedirectUrl: string().url().optional().nullable().or(literal('')),
            passwordExpiration: passwordExpirationPolicyGuard,
            verificationCodePolicy: verificationCodePolicyGuard,
          })
        )
        .partial(),
      response: signInExperienceResponseGuard,
      status: [200, 400, 404, 422, 403, 409],
    }),
    // eslint-disable-next-line complexity
    async (ctx, next) => {
      const {
        query: { removeUnusedDemoSocialConnector },
        body: {
          socialSignInConnectorTargets,
          emailBlocklistPolicy,
          signUpProfileFields,
          customUiCsp,
          usernamePolicy,
          ...rest
        },
      } = ctx.guard;
      const {
        languageInfo,
        signUp,
        signIn,
        mfa,
        adaptiveMfa,
        sentinelPolicy,
        captchaPolicy,
        forgotPasswordMethods,
        hideLogtoBranding,
        passkeySignIn,
        passwordExpiration,
        verificationCodePolicy,
      } = rest;

      const normalizedSignUpProfileFields = await normalizeProfileFields(signUpProfileFields);
      const normalizedCustomUiCsp = conditional(customUiCsp && normalizeCustomUiCsp(customUiCsp));
      const hasCustomUiCsp = hasCustomUiCspSources(normalizedCustomUiCsp);

      if (passwordExpiration) {
        assertThat(
          EnvSet.values.isDevFeaturesEnabled,
          new RequestError({
            code: 'request.invalid_input',
            details: 'Password expiration is not available',
          })
        );
      }

      if (languageInfo) {
        await validateLanguageInfo(languageInfo);
      }

      const [connectors, currentSettings] = await Promise.all([
        getLogtoConnectors(),
        findDefaultSignInExperience(),
      ]);

      // Flipping usernames to case-insensitive would merge accounts that differ only by case, so
      // reject the flip while such conflicts exist. Only the actual case-sensitive ->
      // case-insensitive transition needs checking: a tenant that is already case-insensitive
      // cannot have accumulated case conflicts (uniqueness was enforced case-insensitively), so we
      // skip the (potentially expensive) scan otherwise. The `usernamePolicy` write is itself
      // dev-gated, so this guard is too.
      if (
        EnvSet.values.isDevFeaturesEnabled &&
        usernamePolicy?.caseSensitive === false &&
        currentSettings.usernamePolicy.caseSensitive
      ) {
        const { totalConflicts, samples } = await findCaseConflicts(20);
        if (totalConflicts > 0) {
          throw new RequestError(
            {
              code: 'sign_in_experiences.username_policy_case_conflicts_exist',
              status: 409,
            },
            { totalConflicts, samples }
          );
        }
      }

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

      // Adaptive MFA requires MFA to be enabled when it is being enabled.
      if (adaptiveMfa?.enabled) {
        const effectiveMfa = mfa ?? currentSettings.mfa;

        assertThat(
          isMfaEnabled(effectiveMfa),
          'sign_in_experiences.adaptive_mfa_requires_mfa',
          422
        );

        assertThat(
          isNonSkippableMfaPromptPolicy(effectiveMfa.policy),
          'sign_in_experiences.adaptive_mfa_requires_non_skippable_policy',
          422
        );
      }

      if (adaptiveMfa?.enabled === false) {
        const effectiveMfa = mfa ?? currentSettings.mfa;
        assertThat(
          !isNonSkippableMfaPromptPolicy(effectiveMfa.policy),
          'sign_in_experiences.non_adaptive_mfa_requires_skippable_policy',
          422
        );
      }

      if (adaptiveMfa === undefined && mfa && isMfaEnabled(mfa)) {
        const { adaptiveMfa: currentAdaptiveMfa } = currentSettings;
        if (currentAdaptiveMfa.enabled) {
          assertThat(
            isNonSkippableMfaPromptPolicy(mfa.policy),
            'sign_in_experiences.adaptive_mfa_requires_non_skippable_policy',
            422
          );
        } else {
          assertThat(
            !isNonSkippableMfaPromptPolicy(mfa.policy),
            'sign_in_experiences.non_adaptive_mfa_requires_skippable_policy',
            422
          );
        }
      }

      // Keep backend state aligned with console semantics:
      // if MFA is disabled and adaptive MFA is omitted in request, reset adaptive MFA to false.
      const normalizedAdaptiveMfa =
        mfa && !isMfaEnabled(mfa) && adaptiveMfa === undefined ? { enabled: false } : adaptiveMfa;

      if (forgotPasswordMethods) {
        const forgotPasswordAvailability = getForgotPasswordAvailability(
          connectors,
          forgotPasswordMethods
        );

        for (const method of forgotPasswordMethods) {
          if (
            method === ForgotPasswordMethod.EmailVerificationCode &&
            !forgotPasswordAvailability.email
          ) {
            throw new RequestError({
              code: 'sign_in_experiences.forgot_password_method_requires_connector',
              method: 'email',
            });
          }

          if (
            method === ForgotPasswordMethod.PhoneVerificationCode &&
            !forgotPasswordAvailability.phone
          ) {
            throw new RequestError({
              code: 'sign_in_experiences.forgot_password_method_requires_connector',
              method: 'sms',
            });
          }
        }
      }

      const passwordExpirationPayload =
        passwordExpiration?.enabled === false
          ? { enabled: false }
          : {
              ...currentSettings.passwordExpiration,
              ...passwordExpiration,
            };

      const passwordExpirationResult = conditional(
        EnvSet.values.isDevFeaturesEnabled &&
          passwordExpirationPolicyGuard.safeParse(passwordExpirationPayload)
      );

      if (passwordExpirationResult) {
        assertThat(
          passwordExpirationResult.success,
          new RequestError({
            code: 'sign_in_experiences.password_expiration_invalid_period_days',
            status: 422,
          })
        );
      }

      const currentPasswordExpiration =
        passwordExpirationResult?.success === true ? passwordExpirationResult.data : undefined;

      // `enabledAt` is server-managed and never editable via the API: preserve the stored value
      // while the policy stays enabled, stamp a fresh timestamp when toggling disabled -> enabled,
      // and ignore any client-provided value.
      const storedEnabledAt = currentSettings.passwordExpiration.enabled
        ? currentSettings.passwordExpiration.enabledAt
        : undefined;
      const passwordExpirationToPersist = currentPasswordExpiration?.enabled
        ? {
            ...currentPasswordExpiration,
            enabledAt: storedEnabledAt ?? Date.now(),
          }
        : currentPasswordExpiration;

      if (currentPasswordExpiration?.enabled) {
        const forgotPasswordAvailability = getForgotPasswordAvailability(
          connectors,
          forgotPasswordMethods ?? currentSettings.forgotPasswordMethods
        );

        assertThat(
          forgotPasswordAvailability.email || forgotPasswordAvailability.phone,
          new RequestError({
            code: 'sign_in_experiences.password_expiration_requires_forgot_password',
            status: 422,
          })
        );
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
      }
      if (hasCustomUiCsp) {
        assertThat(
          EnvSet.values.isCloud,
          new RequestError({
            code: 'request.invalid_input',
            details: 'Custom UI CSP configuration is not available',
          })
        );
      }
      if (hideLogtoBranding === true || hasCustomUiCsp) {
        await quota.guardTenantUsageByKey('bringYourUiEnabled');
      }
      if (passkeySignIn?.enabled) {
        await quota.guardTenantUsageByKey('passkeySignInEnabled');
      }

      const payload = {
        ...rest,
        ...conditional(normalizedAdaptiveMfa && { adaptiveMfa: normalizedAdaptiveMfa }),
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
        ...conditional(
          normalizedSignUpProfileFields !== undefined && {
            signUpProfileFields: normalizedSignUpProfileFields,
          }
        ),
        ...conditional(
          normalizedCustomUiCsp !== undefined && {
            customUiCsp: normalizedCustomUiCsp,
          }
        ),
        ...conditional(
          EnvSet.values.isDevFeaturesEnabled &&
            passwordExpiration &&
            passwordExpirationToPersist && { passwordExpiration: passwordExpirationToPersist }
        ),
        // Username policy is gated until the feature ships: ignore writes when the flag is off.
        ...conditional(EnvSet.values.isDevFeaturesEnabled && usernamePolicy && { usernamePolicy }),
        // Verification code policy is gated until the feature ships.
        ...conditional(
          EnvSet.values.isDevFeaturesEnabled && verificationCodePolicy && { verificationCodePolicy }
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

  // Username policy conflict-detection API is gated until the feature ships, so the endpoint is
  // absent (not just hidden) when dev features are off — keeping prod and its OpenAPI doc clean.
  if (EnvSet.values.isDevFeaturesEnabled) {
    usernamePolicyRoutes(...args);
  }
}
/* eslint-enable max-lines */
