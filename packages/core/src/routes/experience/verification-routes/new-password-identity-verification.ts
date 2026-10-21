import { usernameRegEx } from '@logto/core-kit';
import { InteractionEvent, SignInIdentifier, VerificationType } from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { NewPasswordIdentityVerification } from '../classes/verifications/new-password-identity-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

export default function newPasswordIdentityVerificationRoutes<
  T extends ExperienceInteractionRouterContext,
>(router: Router<unknown, T>, { libraries, queries }: TenantContext) {
  router.post(
    `${experienceRoutes.verification}/new-password-identity`,
    koaGuard({
      body: z.object({
        identifier: z.object({
          // Only username is supported for now
          type: z.literal(SignInIdentifier.Username),
          value: z.string().regex(usernameRegEx),
        }),
        password: z.string(),
      }),
      status: [200, 400, 422],
      response: z.object({
        verificationId: z.string(),
      }),
    }),
    koaExperienceVerificationsAuditLog({
      type: VerificationType.NewPasswordIdentity,
      action: Action.Submit,
    }),
    async (ctx, next) => {
      const { identifier, password } = ctx.guard.body;
      const { experienceInteraction, verificationAuditLog } = ctx;

      // The record only proposes a password for an account that does not exist yet. In any other
      // event it would sit next to the identified user's records without ever authenticating them.
      assertThat(
        experienceInteraction.interactionEvent === InteractionEvent.Register,
        new RequestError({ code: 'session.invalid_interaction_type', status: 400 })
      );

      verificationAuditLog.append({
        payload: {
          identifier,
          password,
        },
      });

      const newPasswordIdentityVerification = NewPasswordIdentityVerification.create(
        libraries,
        queries,
        identifier
      );

      await newPasswordIdentityVerification.verify(password);

      experienceInteraction.setVerificationRecord(newPasswordIdentityVerification);

      await experienceInteraction.save();

      ctx.body = { verificationId: newPasswordIdentityVerification.id };

      ctx.status = 200;

      return next();
    }
  );
}
