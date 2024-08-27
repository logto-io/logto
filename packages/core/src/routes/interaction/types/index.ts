import type { SocialUserInfo } from '@logto/connector-kit';
import type {
  UsernamePasswordPayload,
  EmailPasswordPayload,
  PhonePasswordPayload,
  InteractionEvent,
  SocialEmailPayload,
  SocialPhonePayload,
  Profile,
  BindMfa,
  VerifyMfaResult,
} from '@logto/schemas';
import type { z } from 'zod';

import type {
  socialAuthorizationUrlPayloadGuard,
  accountIdIdentifierGuard,
  verifiedEmailIdentifierGuard,
  verifiedPhoneIdentifierGuard,
  socialIdentifierGuard,
  identifierGuard,
  anonymousInteractionResultGuard,
} from './guard.js';

/* Payload Types */
export type PasswordIdentifierPayload =
  | UsernamePasswordPayload
  | EmailPasswordPayload
  | PhonePasswordPayload;

export type SocialVerifiedIdentifierPayload = SocialEmailPayload | SocialPhonePayload;

/**
 * Legacy type for the interaction API.
 * Use the latest experience API instead.
 * Moved to `@logto/schemas`
 */
export type SocialAuthorizationUrlPayload = z.infer<typeof socialAuthorizationUrlPayloadGuard>;

/* Interaction Types */
// Identifier
export type AccountIdIdentifier = z.infer<typeof accountIdIdentifierGuard>;

export type VerifiedEmailIdentifier = z.infer<typeof verifiedEmailIdentifierGuard>;

export type VerifiedPhoneIdentifier = z.infer<typeof verifiedPhoneIdentifierGuard>;

export type SocialIdentifier = z.infer<typeof socialIdentifierGuard>;

export type Identifier = z.infer<typeof identifierGuard>;

// Interaction Result
export type AnonymousInteractionResult = z.infer<typeof anonymousInteractionResultGuard>;

export type RegisterInteractionResult = Omit<AnonymousInteractionResult, 'event'> & {
  event: InteractionEvent.Register;
};

export type SignInInteractionResult = Omit<AnonymousInteractionResult, 'event'> & {
  event: InteractionEvent.SignIn;
};

export type ForgotPasswordInteractionResult = Omit<AnonymousInteractionResult, 'event'> & {
  event: InteractionEvent.ForgotPassword;
};

// Intermediate interaction  result
export type AccountVerifiedInteractionResult =
  | (Omit<SignInInteractionResult, 'accountId' | 'identifiers'> & {
      accountId: string;
      identifiers: Identifier[];
    })
  | (Omit<ForgotPasswordInteractionResult, 'accountId' | 'identifiers'> & {
      accountId: string;
      identifiers: Identifier[];
    });

export type IdentifierVerifiedInteractionResult =
  | RegisterInteractionResult
  | AccountVerifiedInteractionResult;

export type VerifiedRegisterInteractionResult = {
  event: InteractionEvent.Register;
  profile?: Profile;
  identifiers?: Identifier[];
  bindMfas?: BindMfa[];
  pendingAccountId?: string;
  mfaSkipped?: boolean;
};

export type VerifiedSignInInteractionResult = {
  event: InteractionEvent.SignIn;
  accountId: string;
  identifiers: Identifier[];
  profile?: Profile;
  bindMfas?: BindMfa[];
  verifiedMfa?: VerifyMfaResult;
  mfaSkipped?: boolean;
};

export type VerifiedForgotPasswordInteractionResult = {
  event: InteractionEvent.ForgotPassword;
  accountId: string;
  identifiers: Identifier[];
  profile: {
    password: string;
  };
};

export type VerifiedInteractionResult =
  | VerifiedRegisterInteractionResult
  | VerifiedSignInInteractionResult
  | VerifiedForgotPasswordInteractionResult;

export type UserIdentity =
  | { username: string }
  | { email: string }
  | { phone: string }
  | { connectorId: string; userInfo: SocialUserInfo };
