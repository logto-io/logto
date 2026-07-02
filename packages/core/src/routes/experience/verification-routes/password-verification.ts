import {
  InteractionEvent,
  LogtoInlineHookKey,
  passwordVerificationPayloadGuard,
  SentinelActivityAction,
  type HookUser,
  type PostFirstFactorVerificationEvent,
  type User,
  VerificationType,
} from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { appendPasswordPayloadToInlineHookProvisioningProfile } from '../classes/libraries/inline-hook-provisioning-profile.js';
import { validatePostFirstFactorVerificationHookResult } from '../classes/libraries/inline-hook-result-validation.js';
import { withSentinel } from '../classes/libraries/sentinel-guard.js';
import { findUserByIdentifier } from '../classes/utils.js';
import { PasswordVerification } from '../classes/verifications/password-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

const isInvalidCredentialsError = (error: unknown): error is RequestError =>
  error instanceof RequestError &&
  error.code === 'session.invalid_credentials' &&
  error.status === 422;

const toHookUser = ({
  id,
  username,
  primaryEmail,
  primaryPhone,
  name,
  avatar,
  customData,
  profile,
}: User): HookUser => ({
  id,
  username,
  primaryEmail,
  primaryPhone,
  name,
  avatar,
  customData,
  profile,
});

export default function passwordVerificationRoutes<T extends ExperienceInteractionRouterContext>(
  router: Router<unknown, T>,
  { libraries, queries, sentinel }: TenantContext
) {
  router.post(
    `${experienceRoutes.verification}/password`,
    koaGuard({
      body: passwordVerificationPayloadGuard,
      status: [200, 400, 401, 422],
      response: z.object({
        verificationId: z.string(),
      }),
    }),
    koaExperienceVerificationsAuditLog({
      type: VerificationType.Password,
      action: Action.Submit,
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;
      const { identifier, password } = ctx.guard.body;

      ctx.verificationAuditLog.append({
        payload: {
          identifier,
          password,
        },
      });

      const passwordVerification = PasswordVerification.create(libraries, queries, identifier);

      const verifiedUser = await withSentinel(
        {
          ctx,
          sentinel,
          action: SentinelActivityAction.Password,
          identifier,
          payload: {
            event: experienceInteraction.interactionEvent,
            verificationId: passwordVerification.id,
          },
        },
        passwordVerification.verify(password).catch(async (error: unknown) => {
          if (!isInvalidCredentialsError(error)) {
            throw error;
          }

          const { interactionEvent } = experienceInteraction;

          if (interactionEvent !== InteractionEvent.SignIn) {
            throw error;
          }

          const existingUser = await findUserByIdentifier(queries, identifier);

          if (existingUser?.isSuspended) {
            throw error;
          }

          const event: PostFirstFactorVerificationEvent = {
            key: LogtoInlineHookKey.PostFirstFactorVerification,
            interactionEvent,
            verificationType: VerificationType.Password,
            identifier,
            user: existingUser ? toHookUser(existingUser) : null,
            password,
          };

          const hookResult = validatePostFirstFactorVerificationHookResult({
            event,
            result: await libraries.inlineHooks.runHook({
              key: LogtoInlineHookKey.PostFirstFactorVerification,
              event,
            }),
          });

          if (hookResult.action === 'rejectInvalidCredentials') {
            throw error;
          }

          const userProfile = await appendPasswordPayloadToInlineHookProvisioningProfile(
            hookResult.user,
            password
          );
          const user =
            hookResult.action === 'createUser'
              ? await experienceInteraction.provisionLibrary.createUserForInlineHook(userProfile)
              : await experienceInteraction.provisionLibrary.updateUser(
                  hookResult.userId,
                  userProfile
                );

          passwordVerification.markAsVerifiedWithUserId(user.id);

          return user;
        })
      );

      await passwordVerification.verifyPasswordExpiration(verifiedUser);

      experienceInteraction.setVerificationRecord(passwordVerification);
      await experienceInteraction.save();

      ctx.body = { verificationId: passwordVerification.id };

      ctx.status = 200;

      return next();
    }
  );
}
