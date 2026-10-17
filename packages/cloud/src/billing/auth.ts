import { createHash } from 'node:crypto';

import { RequestError } from '@withtyped/server';
import { type JWTVerifyGetKey, jwtVerify } from 'jose';

import { type BillingStore } from './store.js';

/** A caller is identified by the pair, since `sub` is only unique within one issuer. */
export type OperatorIdentity = {
  issuer: string;
  sub: string;
};

export type OperatorAuthConfig = {
  issuer: string;
  audience: string;
  getKey: JWTVerifyGetKey;
  /** Operators allowed to call billing routes. An empty list denies every caller. */
  operators: readonly OperatorIdentity[];
};

/**
 * Verifies the bearer token's signature, issuer, and audience and returns the caller's identity.
 * Throws 401 when the caller is not authenticated. Verification never decides authorization on its
 * own; callers check the identity against an allowlist or membership.
 */
export type VerifiedCaller = OperatorIdentity & {
  /** The email claim, when the issuer includes it in the token. */
  email?: string;
  /** Whether the issuer has verified the email. Only `true` counts as proof of ownership. */
  emailVerified: boolean;
};

export const verifyCaller = async (
  authorization: string | undefined,
  config: Pick<OperatorAuthConfig, 'issuer' | 'audience' | 'getKey'>
): Promise<VerifiedCaller> => {
  const token = /^Bearer (.+)$/.exec(authorization ?? '')?.[1];

  if (!token) {
    throw new RequestError('Unauthorized', 401);
  }

  let sub: string | undefined;
  let issuer: string | undefined;
  let email: string | undefined;
  let emailVerified: boolean | undefined;

  try {
    const { payload } = await jwtVerify(token, config.getKey, {
      issuer: config.issuer,
      audience: config.audience,
      algorithms: ['ES256'],
    });
    sub = payload.sub;
    issuer = payload.iss;
    email = typeof payload.email === 'string' ? payload.email : undefined;
    emailVerified = payload.email_verified === true;
  } catch {
    throw new RequestError('Unauthorized', 401);
  }

  if (!sub || !issuer) {
    throw new RequestError('Unauthorized', 401);
  }

  return { issuer, sub, email, emailVerified };
};

const isOperator = (identity: OperatorIdentity, config: OperatorAuthConfig) =>
  config.operators.some(
    (operator) => operator.issuer === identity.issuer && operator.sub === identity.sub
  );

/**
 * Operator-only routes: a verified caller on the operator allowlist. Anyone else, tenant admins
 * included, gets 403 so a tenant user never reaches cross-tenant billing data.
 */
export const authorizeOperator = async (
  authorization: string | undefined,
  config: OperatorAuthConfig
): Promise<OperatorIdentity> => {
  const identity = await verifyCaller(authorization, config);

  if (!isOperator(identity, config)) {
    throw new RequestError('Forbidden', 403);
  }

  return { issuer: identity.issuer, sub: identity.sub };
};

/**
 * Tenant-scoped routes: an operator may act on any tenant, and any other caller must be an admin
 * of the tenant in the path. A verified admin of a different tenant gets 403.
 */
export const authorizeTenantAdmin = async (
  authorization: string | undefined,
  tenantId: string,
  config: OperatorAuthConfig,
  store: Pick<BillingStore, 'findMembership'>
): Promise<OperatorIdentity> => {
  const identity = await verifyCaller(authorization, config);

  if (isOperator(identity, config)) {
    return { issuer: identity.issuer, sub: identity.sub };
  }

  const role = await store.findMembership(tenantId, identity);

  if (role !== 'admin') {
    throw new RequestError('Forbidden', 403);
  }

  return { issuer: identity.issuer, sub: identity.sub };
};

/** The stored form of an invitation's one-time token. Only this hash is kept, never the token. */
export const hashInvitationToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

export type InvitationForAcceptance = {
  invitee: string;
  tokenHash: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'revoked';
};

/**
 * Invitee routes need both proofs (decided by council as option C): the token's email is verified
 * by the issuer and matches the invited address, and the caller presents the one-time token whose
 * hash is on the invitation. Either proof missing or wrong gives 403, and an invitation that is not
 * pending or has expired gives 403 too.
 */
export const authorizeInvitee = async (
  authorization: string | undefined,
  invitation: InvitationForAcceptance,
  presentedToken: string | undefined,
  config: Pick<OperatorAuthConfig, 'issuer' | 'audience' | 'getKey'>,
  now: Date = new Date()
): Promise<VerifiedCaller> => {
  const caller = await verifyCaller(authorization, config);

  const emailMatches =
    caller.emailVerified &&
    caller.email !== undefined &&
    caller.email.toLowerCase() === invitation.invitee.toLowerCase();
  const tokenMatches =
    presentedToken !== undefined && hashInvitationToken(presentedToken) === invitation.tokenHash;
  const usable = invitation.status === 'pending' && invitation.expiresAt.getTime() > now.getTime();

  if (!emailMatches || !tokenMatches || !usable) {
    throw new RequestError('Forbidden', 403);
  }

  return caller;
};
