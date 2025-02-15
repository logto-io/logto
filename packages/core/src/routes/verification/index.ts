import { TemplateType } from '@logto/connector-kit';
import {
  AdditionalIdentifier,
  SentinelActivityAction,
  SignInIdentifier,
  socialAuthorizationUrlPayloadGuard,
  socialVerificationCallbackPayloadGuard,
  verificationCodeIdentifierGuard,
  VerificationType,
} from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import {
  buildVerificationRecordByIdAndType,
  insertVerificationRecord,
  updateVerificationRecord,
} from '../../libraries/verification.js';
import { withSentinel } from '../experience/classes/libraries/sentinel-guard.js';
import { createNewCodeVerificationRecord } from '../experience/classes/verifications/code-verification.js';
import { PasswordVerification } from '../experience/classes/verifications/password-verification.js';
import { SocialVerification } from '../experience/classes/verifications/social-verification.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

export const verificationApiPrefix = '/verifications';

export default function verificationRoutes<T extends UserRouter>(
  ...[router, tenantContext]: RouterInitArgs<T>
) {
  const { queries, libraries, sentinel } = tenantContext;

  router.post(
    `${verificationApiPrefix}/password`,
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
    `${verificationApiPrefix}/verification-code`,
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
      const isNewIdentifier =
        (identifier.type === SignInIdentifier.Email && identifier.value === user.primaryEmail) ||
        (identifier.type === SignInIdentifier.Phone && identifier.value === user.primaryPhone);

      const codeVerification = createNewCodeVerificationRecord(
        libraries,
        queries,
        identifier,
        isNewIdentifier ? TemplateType.BindNewIdentifier : TemplateType.UserPermissionValidation
      );

      await codeVerification.sendVerificationCode();

      const { expiresAt } = await insertVerificationRecord(
        codeVerification,
        queries,
        isNewIdentifier ? userId : undefined
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
    `${verificationApiPrefix}/verification-code/verify`,
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

  router.post(
    `${verificationApiPrefix}/social`,
    koaGuard({
      body: socialAuthorizationUrlPayloadGuard.extend({
        connectorId: z.string(),
      }),
      response: z.object({
        verificationRecordId: z.string(),
        authorizationUri: z.string(),
        expiresAt: z.string(),
      }),
      status: [201, 400, 404, 422],
    }),
    async (ctx, next) => {
      const { connectorId, ...rest } = ctx.guard.body;

      const socialVerification = SocialVerification.create(libraries, queries, connectorId);

      const authorizationUri = await socialVerification.createAuthorizationUrl(
        ctx,
        tenantContext,
        rest,
        'verificationRecord'
      );

      const { expiresAt } = await insertVerificationRecord(socialVerification, queries);

      ctx.body = {
        verificationRecordId: socialVerification.id,
        authorizationUri,
        expiresAt: new Date(expiresAt).toISOString(),
      };
      ctx.status = 201;

      return next();
    }
  );

  router.post(
    `${verificationApiPrefix}/social/verify`,
    koaGuard({
      body: socialVerificationCallbackPayloadGuard
        .pick({
          connectorData: true,
        })
        .extend({
          verificationRecordId: z.string(),
        }),
      response: z.object({
        verificationRecordId: z.string(),
      }),
      status: [200, 400, 404, 422],
    }),
    async (ctx, next) => {
      const { connectorData, verificationRecordId } = ctx.guard.body;

      const socialVerification = await buildVerificationRecordByIdAndType({
        type: VerificationType.Social,
        id: verificationRecordId,
        queries,
        libraries,
      });

      await socialVerification.verify(ctx, tenantContext, connectorData, 'verificationRecord');

      await updateVerificationRecord(socialVerification, queries);

      ctx.body = {
        verificationRecordId,
      };

      return next();
    }
  );
}
