import { randomBytes, randomUUID } from 'node:crypto';

import { z } from 'zod';

import { hashInvitationToken, type InvitationForAcceptance } from './auth.js';

export const invitationStatusGuard = z.enum(['pending', 'accepted', 'revoked']);

/** A stored invitation. The token itself is never stored, only `tokenHash`. */
export type InvitationRecord = InvitationForAcceptance & {
  id: string;
  tenantId: string;
  inviterSub: string;
  createdAt: Date;
};

/** The invitation as returned to tenant admins: no token hash. */
export const invitationGuard = z.object({
  id: z.string(),
  tenantId: z.string(),
  invitee: z.string(),
  status: invitationStatusGuard,
  inviterSub: z.string(),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
});

export const createInvitationBodyGuard = z.object({
  invitee: z.string().email().max(320),
});

export const acceptInvitationBodyGuard = z.object({
  token: z.string().min(16).max(256),
});

/** Invitations last a week. */
export const invitationLifetimeMs = 7 * 24 * 60 * 60 * 1000;

export const toInvitationView = (record: InvitationRecord) => ({
  id: record.id,
  tenantId: record.tenantId,
  invitee: record.invitee,
  status: record.status,
  inviterSub: record.inviterSub,
  createdAt: record.createdAt,
  expiresAt: record.expiresAt,
});

/** A new invitation and the one-time token that goes to the invitee. The token is shown once. */
export const newInvitation = (input: {
  tenantId: string;
  invitee: string;
  inviterSub: string;
  now?: Date;
}) => {
  const now = input.now ?? new Date();
  const token = randomBytes(32).toString('base64url');

  return {
    token,
    record: {
      id: randomUUID(),
      tenantId: input.tenantId,
      invitee: input.invitee.toLowerCase(),
      inviterSub: input.inviterSub,
      tokenHash: hashInvitationToken(token),
      status: 'pending' as const,
      createdAt: now,
      expiresAt: new Date(now.getTime() + invitationLifetimeMs),
    },
  };
};
