import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import RequestError from '#src/errors/RequestError/index.js';
import {
  verificationRecordDataGuard,
  buildVerificationRecord,
} from '#src/routes/experience/classes/verifications/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { verificationRecordIdHeader } from './constants.js';
import { type WithAuthContext } from './types.js';
import { extractBearerTokenFromHeaders } from './utils.js';

/**
 * Builds a verification record by its id.
 * The `userId` is optional and is only used for user sensitive permission verifications.
 */
const getVerificationRecordResultById = async ({
  id,
  queries,
  libraries,
  userId,
}: {
  id: string;
  queries: Queries;
  libraries: Libraries;
  userId: string;
}): Promise<boolean> => {
  const record = await queries.verificationRecords.findActiveVerificationRecordById(id);
  if (record?.userId !== userId) {
    return false;
  }

  const result = verificationRecordDataGuard.safeParse({
    ...record.data,
    id: record.id,
  });

  if (!result.success) {
    return false;
  }

  const instance = buildVerificationRecord(libraries, queries, result.data);
  return instance.isVerified;
};

/**
 * Auth middleware for OIDC opaque token
 */
export default function koaOidcAuth<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  tenant: TenantContext
): MiddlewareType<StateT, WithAuthContext<ContextT>, ResponseBodyT> {
  const authMiddleware: MiddlewareType<StateT, WithAuthContext<ContextT>, ResponseBodyT> = async (
    ctx,
    next
  ) => {
    const { request } = ctx;
    const accessTokenValue = extractBearerTokenFromHeaders(request.headers);
    const accessToken = await tenant.provider.AccessToken.find(accessTokenValue);

    assertThat(accessToken, new RequestError({ code: 'auth.unauthorized', status: 401 }));

    const { accountId, scopes } = accessToken;
    assertThat(accountId, new RequestError({ code: 'auth.unauthorized', status: 401 }));
    assertThat(scopes.has('openid'), new RequestError({ code: 'auth.forbidden', status: 403 }));

    const verificationRecordId = request.headers[verificationRecordIdHeader];
    const identityVerified =
      typeof verificationRecordId === 'string'
        ? await getVerificationRecordResultById({
            id: verificationRecordId,
            queries: tenant.queries,
            libraries: tenant.libraries,
            userId: accountId,
          })
        : false;

    ctx.auth = {
      type: 'user',
      id: accountId,
      scopes,
      identityVerified,
    };

    return next();
  };

  return authMiddleware;
}
