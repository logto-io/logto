import { RequestError } from '@withtyped/server';
import { generateKeyPair, SignJWT } from 'jose';
import { describe, expect, it, beforeAll } from 'vitest';

import {
  authorizeInvitee,
  authorizeOperator,
  authorizeTenantAdmin,
  hashInvitationToken,
  type InvitationForAcceptance,
  type OperatorAuthConfig,
} from './auth.js';
import { createInMemoryBillingStore } from './store.js';

const issuer = 'https://auth.example.test/oidc';
const audience = 'https://billing.example.test';
const operatorSub = 'operator-user-1';
const tenantAdminSub = 'tenant-admin-user-1';

let privateKey: CryptoKey;
let otherPrivateKey: CryptoKey;
let publicKey: CryptoKey;

beforeAll(async () => {
  const pair = await generateKeyPair('ES256');
  privateKey = pair.privateKey;
  publicKey = pair.publicKey;
  otherPrivateKey = (await generateKeyPair('ES256')).privateKey;
});

const sign = async (
  claims: { sub: string; iss?: string; aud?: string; exp?: string },
  key: CryptoKey = privateKey
) => {
  const builder = new SignJWT({})
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuer(claims.iss ?? issuer)
    .setAudience(claims.aud ?? audience)
    .setSubject(claims.sub)
    .setIssuedAt();

  return builder.setExpirationTime(claims.exp ?? '5m').sign(key);
};

const config = (operators: OperatorAuthConfig['operators'] = [{ issuer, sub: operatorSub }]) =>
  ({
    issuer,
    audience,
    getKey: async () => publicKey,
    operators,
  }) satisfies OperatorAuthConfig;

const expectStatus = async (promise: Promise<unknown>, status: number) => {
  const error = await promise.then(
    () => {
      throw new Error('expected the call to reject');
    },
    (error: unknown) => error
  );

  expect(error).toBeInstanceOf(RequestError);
  expect((error as RequestError).status).toBe(status);
};

describe('authorizeOperator', () => {
  it('returns the identity for an allowlisted operator', async () => {
    const token = await sign({ sub: operatorSub });

    await expect(authorizeOperator(`Bearer ${token}`, config())).resolves.toEqual({
      issuer,
      sub: operatorSub,
    });
  });

  it('rejects a tenant admin with 403 even though the token is valid', async () => {
    const token = await sign({ sub: tenantAdminSub });

    await expectStatus(authorizeOperator(`Bearer ${token}`, config()), 403);
  });

  it('rejects the same subject from a different issuer with 403', async () => {
    const token = await sign({ sub: operatorSub, iss: 'https://other.example.test' });

    await expectStatus(
      authorizeOperator(`Bearer ${token}`, { ...config(), issuer: 'https://other.example.test' }),
      403
    );
  });

  it('denies every caller when the allowlist is empty', async () => {
    const token = await sign({ sub: operatorSub });

    await expectStatus(authorizeOperator(`Bearer ${token}`, config([])), 403);
  });

  it('rejects a request with no bearer token with 401', async () => {
    await expectStatus(authorizeOperator(undefined, config()), 401);
    await expectStatus(authorizeOperator('Basic abc', config()), 401);
  });

  it('rejects a token signed with another key with 401', async () => {
    const token = await sign({ sub: operatorSub }, otherPrivateKey);

    await expectStatus(authorizeOperator(`Bearer ${token}`, config()), 401);
  });

  it('rejects a token for another audience with 401', async () => {
    const token = await sign({ sub: operatorSub, aud: 'https://elsewhere.example.test' });

    await expectStatus(authorizeOperator(`Bearer ${token}`, config()), 401);
  });

  it('rejects an expired token with 401', async () => {
    const token = await sign({ sub: operatorSub, exp: '-1m' });

    await expectStatus(authorizeOperator(`Bearer ${token}`, config()), 401);
  });
});

describe('authorizeTenantAdmin', () => {
  const adminTenant = 'tenant0000000000001';
  const otherTenant = 'tenant0000000000002';
  const adminSub = 'tenant-admin-user-2';
  const memberSub = 'tenant-member-user-1';

  const store = createInMemoryBillingStore({
    members: {
      [adminTenant]: [
        { issuer, sub: adminSub, role: 'admin' },
        { issuer, sub: memberSub, role: 'member' },
      ],
      [otherTenant]: [{ issuer, sub: adminSub, role: 'admin' }],
    },
  });

  it('lets an operator act on any tenant', async () => {
    const token = await sign({ sub: operatorSub });

    await expect(
      authorizeTenantAdmin(`Bearer ${token}`, adminTenant, config(), store)
    ).resolves.toEqual({ issuer, sub: operatorSub });
  });

  it('lets an admin of the tenant in the path through', async () => {
    const token = await sign({ sub: adminSub });

    await expect(
      authorizeTenantAdmin(`Bearer ${token}`, adminTenant, config(), store)
    ).resolves.toEqual({ issuer, sub: adminSub });
  });

  it('rejects an admin of a different tenant with 403', async () => {
    const token = await sign({ sub: adminSub });

    await expectStatus(
      authorizeTenantAdmin(`Bearer ${token}`, 'tenant0000000000003', config(), store),
      403
    );
  });

  it('rejects a plain member of the tenant with 403', async () => {
    const token = await sign({ sub: memberSub });

    await expectStatus(authorizeTenantAdmin(`Bearer ${token}`, adminTenant, config(), store), 403);
  });

  it('rejects a caller who is not a member of the tenant with 403', async () => {
    const token = await sign({ sub: tenantAdminSub });

    await expectStatus(authorizeTenantAdmin(`Bearer ${token}`, adminTenant, config(), store), 403);
  });

  it('rejects an unauthenticated caller with 401', async () => {
    await expectStatus(authorizeTenantAdmin(undefined, adminTenant, config(), store), 401);
  });
});

describe('authorizeInvitee', () => {
  const invitedEmail = 'invitee@example.test';
  const inviteToken = 'one-time-invite-token-0001';
  const future = new Date(Date.now() + 60_000);

  const invitation = (
    overrides: Partial<InvitationForAcceptance> = {}
  ): InvitationForAcceptance => ({
    invitee: invitedEmail,
    tokenHash: hashInvitationToken(inviteToken),
    expiresAt: future,
    status: 'pending',
    ...overrides,
  });

  const signWithEmail = async (email?: string, emailVerified?: boolean) =>
    new SignJWT({
      ...(email === undefined ? {} : { email }),
      ...(emailVerified === undefined ? {} : { email_verified: emailVerified }),
    })
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuer(issuer)
      .setAudience(audience)
      .setSubject('invitee-user-1')
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(privateKey);

  it('accepts a verified matching email with the one-time token', async () => {
    const token = await signWithEmail(invitedEmail, true);

    await expect(
      authorizeInvitee(`Bearer ${token}`, invitation(), inviteToken, config())
    ).resolves.toMatchObject({ sub: 'invitee-user-1', email: invitedEmail, emailVerified: true });
  });

  it('matches the email regardless of case', async () => {
    const token = await signWithEmail('Invitee@Example.Test', true);

    await expect(
      authorizeInvitee(`Bearer ${token}`, invitation(), inviteToken, config())
    ).resolves.toMatchObject({ emailVerified: true });
  });

  it('rejects an unverified email, even when it matches', async () => {
    const token = await signWithEmail(invitedEmail, false);

    await expectStatus(
      authorizeInvitee(`Bearer ${token}`, invitation(), inviteToken, config()),
      403
    );
  });

  it('rejects a token with no email claim', async () => {
    const token = await signWithEmail(undefined, undefined);

    await expectStatus(
      authorizeInvitee(`Bearer ${token}`, invitation(), inviteToken, config()),
      403
    );
  });

  it('rejects a verified email that is not the invited address', async () => {
    const token = await signWithEmail('someone-else@example.test', true);

    await expectStatus(
      authorizeInvitee(`Bearer ${token}`, invitation(), inviteToken, config()),
      403
    );
  });

  it('rejects a missing or wrong one-time token', async () => {
    const token = await signWithEmail(invitedEmail, true);

    await expectStatus(authorizeInvitee(`Bearer ${token}`, invitation(), undefined, config()), 403);
    await expectStatus(
      authorizeInvitee(`Bearer ${token}`, invitation(), 'guessed-token', config()),
      403
    );
  });

  it('rejects an expired, revoked, or already accepted invitation', async () => {
    const token = await signWithEmail(invitedEmail, true);

    await expectStatus(
      authorizeInvitee(
        `Bearer ${token}`,
        invitation({ expiresAt: new Date(Date.now() - 1000) }),
        inviteToken,
        config()
      ),
      403
    );
    await expectStatus(
      authorizeInvitee(`Bearer ${token}`, invitation({ status: 'revoked' }), inviteToken, config()),
      403
    );
    await expectStatus(
      authorizeInvitee(
        `Bearer ${token}`,
        invitation({ status: 'accepted' }),
        inviteToken,
        config()
      ),
      403
    );
  });

  it('rejects an unauthenticated caller with 401', async () => {
    await expectStatus(authorizeInvitee(undefined, invitation(), inviteToken, config()), 401);
  });
});
