import {
  InteractionEvent,
  LogtoActionKey,
  passwordVerificationPayloadGuard,
  SentinelActivityAction,
  type ActionUser,
  type PostFirstFactorVerificationEvent,
  type User,
  VerificationType,
} from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import { conditional } from '@silverhand/essentials';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { appendPasswordPayloadToActionProvisioningProfile } from '../classes/libraries/action-provisioning-profile.js';
import { validatePostFirstFactorVerificationActionResult } from '../classes/libraries/action-result-validation.js';
import { withSentinel } from '../classes/libraries/sentinel-guard.js';
import { findUserByIdentifier, interactionIdentifierToUserProfile } from '../classes/utils.js';
import { PasswordVerification } from '../classes/verifications/password-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

const isInvalidCredentialsError = (error: unknown): error is RequestError =>
  error instanceof RequestError &&
  error.code === 'session.invalid_credentials' &&
  error.status === 422;

const toActionUser = ({
  id,
  username,
  primaryEmail,
  primaryPhone,
  name,
  avatar,
  customData,
  profile,
}: User): ActionUser => ({
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
      status: [200, 400, 401, 409, 422],
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

      const verificationResult = await withSentinel(
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
        passwordVerification
          .verify(password)
          .then((user) => ({ user }))
          .catch(async (error: unknown) => {
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
              key: LogtoActionKey.PostFirstFactorVerification,
              interactionEvent,
              verificationType: VerificationType.Password,
              identifier,
              user: existingUser ? toActionUser(existingUser) : null,
              password,
            };

            const actionResult = validatePostFirstFactorVerificationActionResult({
              event,
              result: await libraries.actions.runAction({
                key: LogtoActionKey.PostFirstFactorVerification,
                event,
                auditContext: {
                  createLog: ctx.createLog,
                  sessionId: ctx.interactionDetails.jti,
                  applicationId: conditional(
                    typeof ctx.interactionDetails.params.client_id === 'string' &&
                      ctx.interactionDetails.params.client_id
                  ),
                  userId: existingUser?.id,
                },
              }),
            });

            if (actionResult.action === 'rejectInvalidCredentials') {
              throw error;
            }

            const actionUserProfile =
              actionResult.action === 'createUser'
                ? {
                    ...interactionIdentifierToUserProfile(identifier),
                    ...actionResult.user,
                  }
                : actionResult.user;
            const userProfile = await appendPasswordPayloadToActionProvisioningProfile(
              actionUserProfile,
              password
            );

            return { actionResult, userProfile };
          })
      );

      const verifiedUser = await (async (): Promise<User> => {
        if (!('actionResult' in verificationResult)) {
          return verificationResult.user;
        }

        const { actionResult, userProfile } = verificationResult;
        const user =
          actionResult.action === 'createUser'
            ? await experienceInteraction.provisionLibrary.createUser(userProfile, {
                checkIdentifierCollision: true,
                mergeCustomData: true,
              })
            : await experienceInteraction.provisionLibrary.updateUser(
                actionResult.userId,
                userProfile,
                { mergeCustomData: true }
              );

        passwordVerification.markAsVerified();

        return user;
      })();

      await passwordVerification.verifyPasswordExpiration(verifiedUser);

      experienceInteraction.setVerificationRecord(passwordVerification);
      await experienceInteraction.save();

      ctx.body = { verificationId: passwordVerification.id };

      ctx.status = 200;

      return next();
    }
  );
}
