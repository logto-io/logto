import type {
  UsernamePasswordPayload,
  EmailPasswordPayload,
  EmailPasscodePayload,
  PhonePasswordPayload,
  PhonePasscodePayload,
  Event,
} from '@logto/schemas';
import type { Context } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import type { z } from 'zod';

import type { SocialUserInfo } from '#src/connectors/types.js';
import type { WithLogContext } from '#src/middleware/koa-audit-log.js';

import type { WithGuardedIdentifierPayloadContext } from '../middleware/koa-interaction-body-guard.js';
import type {
  interactionPayloadGuard,
  sendPasscodePayloadGuard,
  getSocialAuthorizationUrlPayloadGuard,
  accountIdIdentifierGuard,
  verifiedEmailIdentifierGuard,
  verifiedPhoneIdentifierGuard,
  socialIdentifierGuard,
  identifierGuard,
  anonymousInteractionResultGuard,
  verifiedRegisterInteractionResultGuard,
  verifiedSignInteractionResultGuard,
  verifiedForgotPasswordInteractionResultGuard,
  registerProfileSafeGuard,
  forgotPasswordProfileGuard,
} from './guard.js';

// Payload Types
export type InteractionPayload = z.infer<typeof interactionPayloadGuard>;

export type PasswordIdentifierPayload =
  | UsernamePasswordPayload
  | EmailPasswordPayload
  | PhonePasswordPayload;

export type PasscodeIdentifierPayload = EmailPasscodePayload | PhonePasscodePayload;

export type SendPasscodePayload = z.infer<typeof sendPasscodePayloadGuard>;

export type SocialAuthorizationUrlPayload = z.infer<typeof getSocialAuthorizationUrlPayloadGuard>;

// Interaction Types
export type AccountIdIdentifier = z.infer<typeof accountIdIdentifierGuard>;

export type VerifiedEmailIdentifier = z.infer<typeof verifiedEmailIdentifierGuard>;

export type VerifiedPhoneIdentifier = z.infer<typeof verifiedPhoneIdentifierGuard>;

export type SocialIdentifier = z.infer<typeof socialIdentifierGuard>;

export type Identifier = z.infer<typeof identifierGuard>;

export type AnonymousInteractionResult = z.infer<typeof anonymousInteractionResultGuard>;

export type RegisterSafeProfile = z.infer<typeof registerProfileSafeGuard>;

export type ForgotPasswordProfile = z.infer<typeof forgotPasswordProfileGuard>;

export type VerifiedRegisterInteractionResult = z.infer<
  typeof verifiedRegisterInteractionResultGuard
>;

export type VerifiedSignInInteractionResult = z.infer<typeof verifiedSignInteractionResultGuard>;

export type VerifiedForgotPasswordInteractionResult = z.infer<
  typeof verifiedForgotPasswordInteractionResultGuard
>;

export type RegisterInteractionResult = Omit<AnonymousInteractionResult, 'event'> & {
  event: Event.Register;
};

export type SignInInteractionResult = Omit<AnonymousInteractionResult, 'event'> & {
  event: Event.SignIn;
};

export type ForgotPasswordInteractionResult = Omit<AnonymousInteractionResult, 'event'> & {
  event: Event.ForgotPassword;
};

export type PreAccountVerifiedInteractionResult =
  | SignInInteractionResult
  | ForgotPasswordInteractionResult;

export type PayloadVerifiedInteractionResult =
  | RegisterInteractionResult
  | PreAccountVerifiedInteractionResult;

export type AccountVerifiedInteractionResult =
  | (Omit<SignInInteractionResult, 'accountId'> & {
      accountId: string;
    })
  | (Omit<ForgotPasswordInteractionResult, 'accountId'> & {
      accountId: string;
    });

export type IdentifierVerifiedInteractionResult =
  | RegisterInteractionResult
  | AccountVerifiedInteractionResult;

export type VerifiedInteractionResult =
  | VerifiedRegisterInteractionResult
  | VerifiedSignInInteractionResult
  | VerifiedForgotPasswordInteractionResult;

export type InteractionContext = WithGuardedIdentifierPayloadContext<
  WithLogContext<IRouterParamContext & Context>
>;

export type UserIdentity =
  | { username: string }
  | { email: string }
  | { phone: string }
  | { connectorId: string; userInfo: SocialUserInfo };
