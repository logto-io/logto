import {
  AdditionalIdentifier,
  InteractionEvent,
  LogtoActionKey,
  passwordVerificationPayloadGuard,
  SentinelActivityAction,
  SignInIdentifier,
  subjectPasswordVerificationPayloadGuard,
  type ActionUser,
  type InteractionIdentifier,
  type PostFirstFactorVerificationEvent,
  type User,
  type VerificationIdentifier,
  VerificationType,
} from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import { conditional, deduplicate, type Nullable } from '@silverhand/essentials';
import type Router from 'koa-router';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { getClientIdentifierPayload } from '#src/oidc/cimd/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { appendPasswordPayloadToActionProvisioningProfile } from '../classes/libraries/action-provisioning-profile.js';
import { validatePostFirstFactorVerificationActionResult } from '../classes/libraries/action-result-validation.js';
import { withSentinel } from '../classes/libraries/sentinel-guard.js';
import { type SignInExperienceValidator } from '../classes/libraries/sign-in-experience-validator.js';
import { findUserByIdentifier, interactionIdentifierToUserProfile } from '../classes/utils.js';
import { PasswordVerification } from '../classes/verifications/password-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

type VerificationDependencies = Pick<TenantContext, 'libraries' | 'queries' | 'sentinel'>;

type VerifiedPassword = {
  passwordVerification: PasswordVerification;
  verifiedUser: User;
};

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

/**
 * The identifier the sentinel lockout is keyed on: the subject's first identifier the sign-in
 * experience accepts with a password (then any identifier, then the user id), so a step-up and a
 * sign-in of the same account share one lockout bucket.
 */
const getLockoutIdentifier = async (
  user: User,
  signInExperienceValidator: SignInExperienceValidator
): Promise<VerificationIdentifier> => {
  const {
    signIn: { methods },
  } = await signInExperienceValidator.getSignInExperienceData();
  const values: Record<SignInIdentifier, Nullable<string>> = {
    [SignInIdentifier.Username]: user.username,
    [SignInIdentifier.Email]: user.primaryEmail,
    [SignInIdentifier.Phone]: user.primaryPhone,
  };
  const candidates = deduplicate([
    ...methods.filter(({ password }) => password).map(({ identifier }) => identifier),
    ...Object.values(SignInIdentifier),
  ]);

  for (const type of candidates) {
    const value = values[type];

    if (value) {
      return { type, value };
    }
  }

  return { type: AdditionalIdentifier.UserId, value: user.id };
};

/**
 * Verify the password of the subject the interaction carries (`{ password }` with no identifier).
 * The `PostFirstFactorVerification` action fallback is a sign-in concern and does not run here.
 * The variant is only accepted in a `SignIn`, matching the subject-bound code variant.
 *
 * @throws {RequestError} with 400 if the interaction is not a sign-in
 * @throws {RequestError} with 404 if the interaction carries no subject
 */
const verifySubjectPassword = async (
  ctx: ExperienceInteractionRouterContext,
  { libraries, queries, sentinel }: VerificationDependencies,
  password: string
): Promise<VerifiedPassword> => {
  const { experienceInteraction } = ctx;
  const { subjectUserId } = experienceInteraction;

  assertThat(
    experienceInteraction.interactionEvent === InteractionEvent.SignIn,
    new RequestError({ code: 'session.invalid_interaction_type', status: 400 })
  );

  assertThat(
    subjectUserId,
    new RequestError({ code: 'session.identifier_not_found', status: 404 })
  );

  const user = await queries.users.findUserById(subjectUserId);
  const passwordVerification = PasswordVerification.createForUser(libraries, queries, user.id);
  const verifiedUser = await withSentinel(
    {
      ctx,
      sentinel,
      queries,
      action: SentinelActivityAction.Password,
      identifier: await getLockoutIdentifier(user, experienceInteraction.signInExperienceValidator),
      payload: {
        event: experienceInteraction.interactionEvent,
        verificationId: passwordVerification.id,
      },
    },
    passwordVerification.verify(password)
  );

  return { passwordVerification, verifiedUser };
};

/** Verify the password of the identifier the client supplied, with the action fallback in sign-in. */
const verifyIdentifierPassword = async (
  ctx: ExperienceInteractionRouterContext,
  { libraries, queries, sentinel }: VerificationDependencies,
  identifier: InteractionIdentifier,
  password: string
): Promise<VerifiedPassword> => {
  const { experienceInteraction } = ctx;
  const passwordVerification = PasswordVerification.create(libraries, queries, identifier);

  const verificationResult = await withSentinel(
    {
      ctx,
      sentinel,
      queries,
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
              ...getClientIdentifierPayload(
                conditional(
                  typeof ctx.interactionDetails.params.client_id === 'string' &&
                    ctx.interactionDetails.params.client_id
                )
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

  if (!('actionResult' in verificationResult)) {
    return { passwordVerification, verifiedUser: verificationResult.user };
  }

  const { actionResult, userProfile } = verificationResult;
  const verifiedUser =
    actionResult.action === 'createUser'
      ? await experienceInteraction.provisionLibrary.createUser(userProfile, {
          checkIdentifierCollision: true,
          mergeCustomData: true,
        })
      : await experienceInteraction.provisionLibrary.updateUser(actionResult.userId, userProfile, {
          mergeCustomData: true,
        });

  passwordVerification.markAsVerified();

  return { passwordVerification, verifiedUser };
};

export default function passwordVerificationRoutes<T extends ExperienceInteractionRouterContext>(
  router: Router<unknown, T>,
  { libraries, queries, sentinel }: TenantContext
) {
  const dependencies: VerificationDependencies = { libraries, queries, sentinel };

  // The subject-bound variant is part of the unreleased step-up feature: outside it the request
  // contract keeps requiring an identifier, and the OpenAPI document omits the variant.
  const bodyGuard = EnvSet.values.isDevFeaturesEnabled
    ? z.union([passwordVerificationPayloadGuard, subjectPasswordVerificationPayloadGuard])
    : passwordVerificationPayloadGuard;

  router.post(
    `${experienceRoutes.verification}/password`,
    koaGuard({
      body: bodyGuard,
      // 403: a pure step-up supplied a raw identifier
      // 404: no identifier given and the interaction carries no subject
      status: EnvSet.values.isDevFeaturesEnabled
        ? [200, 400, 401, 403, 404, 409, 422]
        : [200, 400, 401, 409, 422],
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

      assertThat(
        !experienceInteraction.isStepUp || !identifier,
        new RequestError({ code: 'session.step_up.forbidden_route', status: 403 })
      );

      ctx.verificationAuditLog.append({
        payload: {
          identifier,
          password,
        },
      });

      const { passwordVerification, verifiedUser } = identifier
        ? await verifyIdentifierPassword(ctx, dependencies, identifier, password)
        : await verifySubjectPassword(ctx, dependencies, password);

      await passwordVerification.verifyPasswordExpiration(verifiedUser);

      experienceInteraction.setVerificationRecord(passwordVerification);
      await experienceInteraction.save();

      ctx.body = { verificationId: passwordVerification.id };

      ctx.status = 200;

      return next();
    }
  );
}
