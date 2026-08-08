import { type MiddlewareType } from 'koa';
import { errors } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import { hasAppLevelAccessControlChecked } from '#src/oidc/application-access-control.js';
import { isCimdClient } from '#src/oidc/cimd/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import assertThat from '#src/utils/assert-that.js';

export default function koaAppAccessControl<
  StateT,
  ContextT extends WithInteractionDetailsContext,
  ResponseBodyT,
>(envSet: EnvSet, libraries: Libraries): MiddlewareType<StateT, ContextT, ResponseBodyT> {
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

    if (isCimdClient(envSet, clientId)) {
      /**
       * Application-level access control only applies to registered applications; the library's
       * fallback lookup would query the applications table with the identifier URL and deny on
       * not-found.
       */
      return next();
    }

    if (
      hasAppLevelAccessControlChecked(ctx.interactionDetails.result, clientId, session.accountId)
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
