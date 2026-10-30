import * as s from 'superstruct';

const pendingStepUpActionsWithoutInput = Object.freeze([
  'enter-subpage',
  'enable-mfa',
  'disable-mfa',
  'enable-passkey-prompt',
  'disable-passkey-prompt',
  'remove-username',
  'remove-email',
  'remove-phone',
  'load-sessions',
  'load-trusted-devices',
] as const);

type PendingStepUpActionWithoutInput = (typeof pendingStepUpActionsWithoutInput)[number];

/**
 * A sensitive Account Center action that is waiting for an OIDC step-up. It carries only the input
 * needed to run the action again: never a credential, a one-time code, a WebAuthn payload, or a
 * token.
 */
export type PendingStepUpAction =
  | { [Type in PendingStepUpActionWithoutInput]: { type: Type } }[PendingStepUpActionWithoutInput]
  | { type: 'remove-social'; connectorId: string }
  | { type: 'create-personal-access-token'; name: string; expiryDays: number }
  | { type: 'rename-personal-access-token'; currentName: string; name: string }
  | { type: 'revoke-personal-access-token'; name: string }
  | { type: 'revoke-session'; sessionId: string }
  | { type: 'revoke-grant'; applicationId: string; grantIds: string[] }
  | { type: 'remove-trusted-device'; trustedDeviceId: string }
  | { type: 'rename-passkey'; id: string; name: string }
  | { type: 'delete-passkey'; id: string };

/**
 * - `authorizing`: Account Center redirected to the authorization endpoint for the step-up.
 * - `authorized`: the callback exchanged the code, and the elevated token set replaced the old one.
 * - `resumable`: the page that loaded after the callback may run the action, once.
 */
export type PendingStepUpPhase = 'authorizing' | 'authorized' | 'resumable';

export type StoredPendingStepUp = {
  action: PendingStepUpAction;
  /** The Account Center pathname to return to, including the base path. */
  route: string;
  phase: PendingStepUpPhase;
  createdAt: number;
};

const pendingStepUpActionGuard = s.union([
  s.object({ type: s.enums(pendingStepUpActionsWithoutInput) }),
  s.object({ type: s.literal('remove-social'), connectorId: s.string() }),
  s.object({
    type: s.literal('create-personal-access-token'),
    name: s.string(),
    expiryDays: s.number(),
  }),
  s.object({
    type: s.literal('rename-personal-access-token'),
    currentName: s.string(),
    name: s.string(),
  }),
  s.object({ type: s.literal('revoke-personal-access-token'), name: s.string() }),
  s.object({ type: s.literal('revoke-session'), sessionId: s.string() }),
  s.object({
    type: s.literal('revoke-grant'),
    applicationId: s.string(),
    grantIds: s.array(s.string()),
  }),
  s.object({ type: s.literal('remove-trusted-device'), trustedDeviceId: s.string() }),
  s.object({ type: s.literal('rename-passkey'), id: s.string(), name: s.string() }),
  s.object({ type: s.literal('delete-passkey'), id: s.string() }),
]);

export const storedPendingStepUpGuard = s.object({
  action: pendingStepUpActionGuard,
  route: s.string(),
  phase: s.enums(['authorizing', 'authorized', 'resumable']),
  createdAt: s.number(),
});
