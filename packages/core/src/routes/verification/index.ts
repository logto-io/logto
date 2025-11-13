import { TemplateType } from '@logto/connector-kit';
import {
  AdditionalIdentifier,
  bindWebAuthnPayloadGuard,
  SentinelActivityAction,
  SignInIdentifier,
  socialAuthorizationUrlPayloadGuard,
  socialVerificationCallbackPayloadGuard,
  verificationCodeIdentifierGuard,
  VerificationType,
  webAuthnRegistrationOptionsGuard,
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
import { WebAuthnVerification } from '../experience/classes/verifications/web-authn-verification.js';
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
      status: [201, 400, 422],
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
          ctx,
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
        // Optional: explicitly specify the template type to use (limited set)
        templateType: z
          .union([
            z.literal(TemplateType.BindMfa),
            z.literal(TemplateType.UserPermissionValidation),
          ])
          .optional(),
      }),
      response: z.object({ verificationRecordId: z.string(), expiresAt: z.string() }),
      status: [201, 501],
    }),
    async (ctx, next) => {
      const { id: userId, clientId: applicationId } = ctx.auth;
      const { identifier, templateType: inputTemplateType } = ctx.guard.body;

      const user = await queries.users.findUserById(userId);
      const isNewIdentifier =
        (identifier.type === SignInIdentifier.Email && identifier.value !== user.primaryEmail) ||
        (identifier.type === SignInIdentifier.Phone && identifier.value !== user.primaryPhone);

      const templateType = isNewIdentifier
        ? TemplateType.BindNewIdentifier
        : (inputTemplateType ?? TemplateType.UserPermissionValidation);

      const codeVerification = createNewCodeVerificationRecord(
        libraries,
        queries,
        identifier,
        templateType
      );

      // Build the user context information for the verification code email template.
      const emailContextPayload =
        identifier.type === SignInIdentifier.Email
          ? await libraries.passcodes.buildVerificationCodeContext({ user, applicationId })
          : undefined;

      await codeVerification.sendVerificationCode({
        ...ctx.emailI18n,
        ...emailContextPayload,
      });

      const { expiresAt } = await insertVerificationRecord(
        codeVerification,
        queries,
        isNewIdentifier ? undefined : userId
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
          ctx,
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
        scope: z.string().optional(),
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

  /**
   * WebAuthn registration (passkey binding)
   *
   * The rpId must be exactly the domain from which this API is accessed.
   * This keeps behavior aligned with the experience flow.
   *
   */
  router.post(
    `${verificationApiPrefix}/web-authn/registration`,
    koaGuard({
      response: z.object({
        verificationRecordId: z.string(),
        registrationOptions: webAuthnRegistrationOptionsGuard,
        expiresAt: z.string(),
      }),
      status: [200],
    }),
    async (ctx, next) => {
      const {
        auth: { id: userId },
        URL: { hostname },
      } = ctx;

      const webAuthnVerification = WebAuthnVerification.create(libraries, queries, userId);

      const registrationOptions = await webAuthnVerification.generateWebAuthnRegistrationOptions(
        hostname // RP ID: Use the domain of the current API request (custom domain supported)
      );

      const { expiresAt } = await insertVerificationRecord(webAuthnVerification, queries, userId);

      ctx.body = {
        verificationRecordId: webAuthnVerification.id,
        registrationOptions,
        expiresAt: new Date(expiresAt).toISOString(),
      };

      return next();
    }
  );

  router.post(
    `${verificationApiPrefix}/web-authn/registration/verify`,
    koaGuard({
      body: z.object({
        verificationRecordId: z.string(),
        payload: bindWebAuthnPayloadGuard,
      }),
      response: z.object({
        verificationRecordId: z.string(),
      }),
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { verificationRecordId, payload } = ctx.guard.body;

      const webAuthnVerification = await buildVerificationRecordByIdAndType({
        type: VerificationType.WebAuthn,
        id: verificationRecordId,
        queries,
        libraries,
      });
      await webAuthnVerification.verifyWebAuthnRegistration(ctx, payload);
      await updateVerificationRecord(webAuthnVerification, queries);

      ctx.body = {
        verificationRecordId: webAuthnVerification.id,
      };

      return next();
    }
  );
}
