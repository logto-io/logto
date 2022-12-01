import type {
  UsernamePasswordPayload,
  EmailPasswordPayload,
  EmailPasscodePayload,
  PhonePasswordPayload,
  PhonePasscodePayload,
} from '@logto/schemas';
import type { Context } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import type { z } from 'zod';

import type { SocialUserInfo } from '#src/connectors/types.js';

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
  customInteractionResultGuard,
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

// Identifier Types
export type AccountIdIdentifier = z.infer<typeof accountIdIdentifierGuard>;

export type VerifiedEmailIdentifier = z.infer<typeof verifiedEmailIdentifierGuard>;

export type VerifiedPhoneIdentifier = z.infer<typeof verifiedPhoneIdentifierGuard>;

export type SocialIdentifier = z.infer<typeof socialIdentifierGuard>;

export type Identifier = z.infer<typeof identifierGuard>;

export type CustomInteractionResult = z.infer<typeof customInteractionResultGuard>;

export type InteractionContext = WithGuardedIdentifierPayloadContext<IRouterParamContext & Context>;

export type UserIdentity =
  | { username: string }
  | { email: string }
  | { phone: string }
  | { connectorId: string; userInfo: SocialUserInfo };
