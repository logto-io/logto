import {
  AdditionalIdentifier,
  InteractionEvent,
  SentinelActivityAction,
  SignInIdentifier,
  verificationCodeIdentifierGuard,
  VerificationType,
} from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import { EnvSet } from '../../env-set/index.js';
import {
  buildVerificationRecordByIdAndType,
  insertVerificationRecord,
  updateVerificationRecord,
} from '../../libraries/verification.js';
import { withSentinel } from '../experience/classes/libraries/sentinel-guard.js';
import { createNewCodeVerificationRecord } from '../experience/classes/verifications/code-verification.js';
import { PasswordVerification } from '../experience/classes/verifications/password-verification.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

export default function verificationRoutes<T extends UserRouter>(
  ...[router, { queries, libraries, sentinel }]: RouterInitArgs<T>
) {
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  router.post(
    '/verifications/password',
    koaGuard({
      body: z.object({ password: z.string().min(1) }),
      response: z.object({ verificationRecordId: z.string(), expiresAt: z.string() }),
      status: [201, 422],
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { password } = ctx.guard.body;

      const passwordVerification = PasswordVerification.create(libraries, queries, {
        type: AdditionalIdentifier.UserId,
        value: userId,
      });
      await withSentinel(
        {
          sentinel,
          action: SentinelActivityAction.Password,
          identifier: {
            type: AdditionalIdentifier.UserId,
            value: userId,
          },
          payload: {
            verificationId: passwordVerification.id,
          },
        },
        passwordVerification.verify(password)
      );

      const { expiresAt } = await insertVerificationRecord(passwordVerification, queries, userId);

      ctx.body = {
        verificationRecordId: passwordVerification.id,
        expiresAt: new Date(expiresAt).toISOString(),
      };
      ctx.status = 201;

      return next();
    }
  );

  router.post(
    '/verifications/verification-code',
    koaGuard({
      body: z.object({
        identifier: verificationCodeIdentifierGuard,
      }),
      response: z.object({ verificationRecordId: z.string(), expiresAt: z.string() }),
      status: [201, 501],
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { identifier } = ctx.guard.body;

      const user = await queries.users.findUserById(userId);

      const codeVerification = createNewCodeVerificationRecord(
        libraries,
        queries,
        identifier,
        // TODO(LOG-10148): Add new event
        InteractionEvent.SignIn
      );

      await codeVerification.sendVerificationCode();

      const { expiresAt } = await insertVerificationRecord(
        codeVerification,
        queries,
        // If the identifier is the primary email or phone, the verification record is associated with the user.
        (identifier.type === SignInIdentifier.Email && identifier.value === user.primaryEmail) ||
          (identifier.type === SignInIdentifier.Phone && identifier.value === user.primaryPhone)
          ? userId
          : undefined
      );

      ctx.body = {
        verificationRecordId: codeVerification.id,
        expiresAt: new Date(expiresAt).toISOString(),
      };
      ctx.status = 201;

      return next();
    }
  );

  router.post(
    '/verifications/verification-code/verify',
    koaGuard({
      body: z.object({
        identifier: verificationCodeIdentifierGuard,
        verificationId: z.string(),
        code: z.string(),
      }),
      response: z.object({ verificationRecordId: z.string() }),
      // 501: connector not found
      status: [200, 400, 501],
    }),
    async (ctx, next) => {
      const { identifier, code, verificationId } = ctx.guard.body;

      const codeVerification = await buildVerificationRecordByIdAndType({
        type:
          identifier.type === SignInIdentifier.Email
            ? VerificationType.EmailVerificationCode
            : VerificationType.PhoneVerificationCode,
        id: verificationId,
        queries,
        libraries,
      });

      await withSentinel(
        {
          sentinel,
          action: SentinelActivityAction.VerificationCode,
          identifier,
          payload: {
            verificationId: codeVerification.id,
          },
        },
        codeVerification.verify(identifier, code)
      );

      await updateVerificationRecord(codeVerification, queries);

      ctx.body = { verificationRecordId: codeVerification.id };

      return next();
    }
  );
}
