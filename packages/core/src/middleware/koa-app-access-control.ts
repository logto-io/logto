import { type MiddlewareType } from 'koa';
import { errors } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import type { WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import { hasAppLevelAccessControlChecked } from '#src/oidc/application-access-control.js';
import type Libraries from '#src/tenants/Libraries.js';
import assertThat from '#src/utils/assert-that.js';

export default function koaAppAccessControl<
  StateT,
  ContextT extends WithInteractionDetailsContext,
  ResponseBodyT,
>(libraries: Libraries): MiddlewareType<StateT, ContextT, ResponseBodyT> {
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

    return next();
  };
}
