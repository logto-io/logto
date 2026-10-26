import { TemplateType } from '@logto/connector-kit';
import { VerificationType } from '@logto/schemas';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import {
  verificationRecordDataGuard,
  buildVerificationRecord,
  type VerificationRecord,
} from '#src/routes/experience/classes/verifications/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import { isFirstPartyClient } from '#src/utils/assert-first-party-client.js';
import assertThat from '#src/utils/assert-that.js';

import { satisfiesAuthenticationContextPolicy } from './authentication-context.js';
import { verificationRecordIdHeader } from './constants.js';
import { type WithAuthContext } from './types.js';
import { extractBearerTokenFromHeaders } from './utils.js';

const isUserPermissionVerificationRecord = (record: VerificationRecord) => {
  if (!record.isVerified) {
    return false;
  }

  switch (record.type) {
    case VerificationType.Password: {
      return true;
    }
    case VerificationType.EmailVerificationCode:
    case VerificationType.PhoneVerificationCode: {
      return record.templateType === TemplateType.UserPermissionValidation;
    }
    default: {
      return false;
    }
  }
};

/**
 * Checks whether the verification record exists, belongs to the given user, and can be used for
 * user permission verification.
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
  return isUserPermissionVerificationRecord(instance);
};

/**
 * Evaluate the OIDC authentication-context branch of `identityVerified`: the access token must
 * carry a Logto authentication context that satisfies the Account API policy under the tenant's
 * freshness window, and must have been issued to a first-party application.
 *
 * The caller's application is resolved here as well, even when the token's own context is already
 * insufficient: it decides whether the RFC 9470 challenge that the sensitive routes answer with
 * can help, and recording it keeps those routes from looking the application up again. A
 * third-party token never reads the tenant policy, because no context would let it operate on the
 * account here.
 */
const getOidcIdentityVerification = async ({
  extra,
  queries,
  clientId,
}: {
  extra: unknown;
  queries: Queries;
  clientId?: string;
}): Promise<{
  identityVerified: boolean;
  isFirstPartyClient: boolean;
  maximumAuthenticationAgeInSeconds?: number;
}> => {
  const isFirstParty = await isFirstPartyClient(queries, clientId);

  if (!isFirstParty) {
    return { identityVerified: false, isFirstPartyClient: false };
  }

  const maximumAuthenticationAgeInSeconds =
    await queries.accountCenters.getMaximumAuthenticationAgeInSeconds();

  return {
    identityVerified: satisfiesAuthenticationContextPolicy(
      extra,
      maximumAuthenticationAgeInSeconds
    ),
    isFirstPartyClient: true,
    maximumAuthenticationAgeInSeconds,
  };
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

    const { accountId, scopes, clientId, sessionUid } = accessToken;
    assertThat(accountId, new RequestError({ code: 'auth.unauthorized', status: 401 }));
    assertThat(scopes.has('openid'), new RequestError({ code: 'auth.forbidden', status: 403 }));

    const verificationRecordId = request.headers[verificationRecordIdHeader];
    const legacyIdentityVerified =
      typeof verificationRecordId === 'string'
        ? await getVerificationRecordResultById({
            id: verificationRecordId,
            queries: tenant.queries,
            libraries: tenant.libraries,
            userId: accountId,
          })
        : false;

    // OIDC step-up authentication: a token minted by a recent qualifying authentication lets a
    // first-party application operate on the account without a separate verification record.
    const oidcVerification = EnvSet.values.isDevFeaturesEnabled
      ? await getOidcIdentityVerification({
          extra: accessToken.extra,
          queries: tenant.queries,
          clientId,
        })
      : undefined;

    const oidcIdentityVerified = oidcVerification?.identityVerified ?? false;

    ctx.auth = {
      type: 'user',
      id: accountId,
      scopes,
      clientId,
      identityVerified: oidcIdentityVerified || legacyIdentityVerified,
      sessionUid,
      isFirstPartyClient: oidcVerification?.isFirstPartyClient,
      maximumAuthenticationAgeInSeconds: oidcVerification?.maximumAuthenticationAgeInSeconds,
    };

    return next();
  };

  return authMiddleware;
}
