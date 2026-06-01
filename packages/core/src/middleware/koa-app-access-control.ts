import { type MiddlewareType } from 'koa';
import { errors } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import type { WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import {
  hasAppLevelAccessControlChecked,
  markAppLevelAccessControlChecked,
} from '#src/oidc/application-access-control.js';
import type Libraries from '#src/tenants/Libraries.js';
import assertThat from '#src/utils/assert-that.js';

type KoaAppAccessControlOptions<ContextT> = {
  readonly markInteractionResult?: boolean | ((ctx: ContextT) => boolean | Promise<boolean>);
};

const shouldMarkInteractionResult = async <ContextT>(
  ctx: ContextT,
  option: KoaAppAccessControlOptions<ContextT>['markInteractionResult']
) => {
  if (typeof option === 'function') {
    return option(ctx);
  }

  return option === true;
};

export default function koaAppAccessControl<
  StateT,
  ContextT extends WithInteractionDetailsContext,
  ResponseBodyT,
>(
  libraries: Libraries,
  options: KoaAppAccessControlOptions<ContextT> = {}
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const {
      params: { client_id: clientId },
      session,
    } = ctx.interactionDetails;

    assertThat(session, new RequestError({ code: 'session.not_found' }));
    assertThat(
      clientId && typeof clientId === 'string',
      new errors.InvalidClient('client must be available')
    );

    if (
      hasAppLevelAccessControlChecked(ctx.interactionDetails.result, clientId, session.accountId) ||
      hasAppLevelAccessControlChecked(
        ctx.interactionDetails.lastSubmission,
        clientId,
        session.accountId
      )
    ) {
      return next();
    }

    await libraries.applicationAccessControl.assertUserHasApplicationAccess(
      clientId,
      session.accountId
    );

    if (await shouldMarkInteractionResult(ctx, options.markInteractionResult)) {
      ctx.interactionDetails.result = markAppLevelAccessControlChecked(
        ctx.interactionDetails.result ?? ctx.interactionDetails.lastSubmission,
        clientId,
        session.accountId
      );
      await ctx.interactionDetails.persist();
    }

    return next();
  };
}
