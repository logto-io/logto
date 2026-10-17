import createServer, { compose, withBody, withRequest } from '@withtyped/server';
import { generateKeyPair, SignJWT } from 'jose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createBillingRouter } from './router.js';
import { createInMemoryBillingStore } from './store.js';

const issuer = 'https://auth.example.test/oidc';
const audience = 'https://billing.example.test';
const tenantId = 'tenant0000000000001';
const adminSub = 'tenant-admin-invite-1';
const memberSub = 'tenant-member-invite-1';
const inviteeSub = 'invitee-user-1';
const invitedEmail = 'invitee@example.test';
const port = 19_433;

describe('invitation routes over HTTP', () => {
  let privateKey: CryptoKey;
  let publicKey: CryptoKey;
  let baseUrl = '';
  let close: () => Promise<void> = async () => {};
  let inviteToken = '';
  let invitationId = '';

  const sign = async (sub: string, claims: { email?: string; email_verified?: boolean } = {}) =>
    new SignJWT({ ...claims })
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuer(issuer)
      .setAudience(audience)
      .setSubject(sub)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(privateKey);

  beforeAll(async () => {
    const pair = await generateKeyPair('ES256');
    privateKey = pair.privateKey;
    publicKey = pair.publicKey;

    const store = createInMemoryBillingStore({
      members: {
        [tenantId]: [
          { issuer, sub: adminSub, role: 'admin' },
          { issuer, sub: memberSub, role: 'member' },
        ],
      },
    });
    const router = createBillingRouter(store, {
      issuer,
      audience,
      getKey: async () => publicKey,
      operators: [],
    });

    const server = createServer({
      port,
      logLevel: 'none',
      composer: compose(withRequest()).and(withBody()).and(router.routes()),
    });

    baseUrl = `http://127.0.0.1:${port}`;
    await server.listen();
    close = server.close;
  });

  afterAll(async () => {
    await close();
  });

  it('lets a tenant admin create an invitation and returns the one-time token once', async () => {
    const response = await fetch(`${baseUrl}/api/tenants/${tenantId}/invitations`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${await sign(adminSub)}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ invitee: invitedEmail }),
    });

    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      invitation: { id: string; invitee: string; status: string };
      token: string;
    };

    expect(body.invitation).toMatchObject({ invitee: invitedEmail, status: 'pending' });
    expect(body.token.length).toBeGreaterThanOrEqual(16);
    inviteToken = body.token;
    invitationId = body.invitation.id;
  });

  it('refuses to create an invitation for a plain member', async () => {
    const response = await fetch(`${baseUrl}/api/tenants/${tenantId}/invitations`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${await sign(memberSub)}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ invitee: 'other@example.test' }),
    });

    expect(response.status).toBe(403);
  });

  it('refuses to create an invitation without a token', async () => {
    const response = await fetch(`${baseUrl}/api/tenants/${tenantId}/invitations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ invitee: 'other@example.test' }),
    });

    expect(response.status).toBe(401);
  });

  it('lists invitations for the admin without exposing the token or its hash', async () => {
    const response = await fetch(`${baseUrl}/api/tenants/${tenantId}/invitations`, {
      headers: { authorization: `Bearer ${await sign(adminSub)}` },
    });

    expect(response.status).toBe(200);

    const body = (await response.json()) as { invitations: Array<Record<string, unknown>> };

    expect(body.invitations).toHaveLength(1);
    expect(body.invitations[0]).not.toHaveProperty('tokenHash');
    expect(body.invitations[0]).not.toHaveProperty('token');
  });

  it('refuses acceptance when the invitee email is not verified', async () => {
    const response = await fetch(`${baseUrl}/api/invitations/${invitationId}/accept`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${await sign(inviteeSub, { email: invitedEmail, email_verified: false })}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ token: inviteToken }),
    });

    expect(response.status).toBe(403);
  });

  it('refuses acceptance with a wrong token', async () => {
    const response = await fetch(`${baseUrl}/api/invitations/${invitationId}/accept`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${await sign(inviteeSub, { email: invitedEmail, email_verified: true })}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ token: 'not-the-real-token-0001' }),
    });

    expect(response.status).toBe(403);
  });

  it('returns 401 for acceptance without a token', async () => {
    const response = await fetch(`${baseUrl}/api/invitations/${invitationId}/accept`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: inviteToken }),
    });

    expect(response.status).toBe(401);
  });

  it('accepts with a verified matching email and the one-time token', async () => {
    const response = await fetch(`${baseUrl}/api/invitations/${invitationId}/accept`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${await sign(inviteeSub, { email: invitedEmail, email_verified: true })}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ token: inviteToken }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      invitation: { id: invitationId, status: 'accepted' },
    });
  });

  it('refuses a second acceptance of the same invitation', async () => {
    const response = await fetch(`${baseUrl}/api/invitations/${invitationId}/accept`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${await sign(inviteeSub, { email: invitedEmail, email_verified: true })}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ token: inviteToken }),
    });

    expect(response.status).toBe(403);
  });

  it('gives the same 403 for an unknown invitation as for a wrong token', async () => {
    const response = await fetch(`${baseUrl}/api/invitations/does-not-exist/accept`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${await sign(inviteeSub, { email: invitedEmail, email_verified: true })}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ token: inviteToken }),
    });

    expect(response.status).toBe(403);
  });
});
