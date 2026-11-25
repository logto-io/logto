import { LogtoActionKey } from '@logto/schemas';

import {
  JwtCustomizerTypeDefinitionKey,
  jwtCustomizerUserContextTypeDefinition,
} from '@/consts/jwt-customizer-type-definition';
import { isValidEnvironmentVariableKey } from '@/utils/validator';

import { type ActionForm } from '../type';

export enum ActionTypeDefinitionKey {
  EnvironmentVariables = 'EnvironmentVariables',
  ActionEvent = 'ActionEvent',
  ActionUser = 'ActionUser',
  ActionUserPatch = 'ActionUserPatch',
  PostFirstFactorVerificationEvent = 'PostFirstFactorVerificationEvent',
  PostSignInEvent = 'PostSignInEvent',
  PostFirstFactorVerificationResult = 'PostFirstFactorVerificationResult',
  PostSignInResult = 'PostSignInResult',
  PreRegisterUser = 'PreRegisterUser',
  PreRegisterEvent = 'PreRegisterEvent',
  PreRegisterResult = 'PreRegisterResult',
  ActionPayload = 'ActionPayload',
}

export const actionUserTypeDefinition = `type ${ActionTypeDefinitionKey.ActionUser} = {
  id: string;
  username: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  name: string | null;
  avatar: string | null;
  customData: Record<string, unknown>;
  profile: Record<string, unknown>;
};`;

export const actionUserPatchTypeDefinition = `type ${ActionTypeDefinitionKey.ActionUserPatch} = {
  username?: string | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  name?: string | null;
  avatar?: string | null;
  customData?: Record<string, unknown>;
  profile?: Record<string, unknown>;
  // Additional password fields may be present for password-managed provisioning.
  [key: string]: unknown;
};`;

// Keep these literals aligned with `LogtoActionKey` so the editor reflects the runtime event payload.
export const postFirstFactorVerificationEventTypeDefinition = `type ${ActionTypeDefinitionKey.PostFirstFactorVerificationEvent} = {
  key: 'action.postFirstFactorVerification';
  interactionEvent: 'SignIn';
  verificationType: 'Password';
  identifier: {
    type: 'username' | 'email' | 'phone';
    value: string;
  };
  user: ${ActionTypeDefinitionKey.ActionUser} | null;
  /**
   * Sensitive credential provided for action-controlled password verification.
   * Never log or persist this value outside this script.
   */
  password: string;
};`;

export const postSignInEventTypeDefinition = `type ${ActionTypeDefinitionKey.PostSignInEvent} = {
  key: 'action.postSignIn';
  interactionEvent: 'SignIn';
  user: ${JwtCustomizerTypeDefinitionKey.JwtCustomizerUserContext};
};`;

export const postFirstFactorVerificationResultTypeDefinition = `type ${ActionTypeDefinitionKey.PostFirstFactorVerificationResult} =
  | {
      action: 'createUser';
      user: ${ActionTypeDefinitionKey.ActionUserPatch};
      passwordVerified: true;
    }
  | {
      action: 'updateUser';
      user: ${ActionTypeDefinitionKey.ActionUserPatch};
      passwordVerified: true;
    };`;

export const postSignInResultTypeDefinition = `type ${ActionTypeDefinitionKey.PostSignInResult} = {
  action: 'updateUser';
  user?: ${ActionTypeDefinitionKey.ActionUserPatch};
};`;

export const preRegisterUserTypeDefinition = `type ${ActionTypeDefinitionKey.PreRegisterUser} = {
  username?: string | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  name?: string | null;
  avatar?: string | null;
  customData?: Record<string, unknown>;
  profile?: Record<string, unknown>;
  /** Present when the user registers with a social connector. */
  socialIdentity?: {
    target: string;
    userInfo: { id: string; email?: string; phone?: string; name?: string; avatar?: string };
  };
  /** Present when the user registers with enterprise SSO. */
  enterpriseSsoIdentity?: { ssoConnectorId: string; issuer: string; identityId: string };
};`;

export const preRegisterEventTypeDefinition = `type ${ActionTypeDefinitionKey.PreRegisterEvent} = {
  key: 'action.preRegister';
  interactionEvent: 'Register';
  /** Types of the verifications completed in this registration, such as 'EmailVerificationCode', 'Social', or 'OneTimeToken'. */
  verificationTypes: string[];
  user: ${ActionTypeDefinitionKey.PreRegisterUser};
  applicationId?: string;
  request: { ip?: string; userAgent?: string };
};`;

export const preRegisterResultTypeDefinition = `type ${ActionTypeDefinitionKey.PreRegisterResult} =
  | { action: 'allow' }
  | {
      action: 'deny';
      /** Plain text shown to the end user, up to 256 characters. */
      message?: string;
    };`;

export const buildEnvironmentVariablesTypeDefinition = (
  envVariables?: ActionForm['environmentVariables']
) => {
  const typeDefinition = envVariables
    ? `{
  ${envVariables
    // Align with request payload filtering (`key && value`) and form key validation
    // so Monaco only types env vars that can actually be used at runtime.
    .map(({ key, value }) => ({ key: key.trim(), value }))
    .filter(
      ({ key, value }) => Boolean(key) && Boolean(value) && isValidEnvironmentVariableKey(key)
    )
    // Quote keys so keys like `0FOO` stay valid TypeScript property names.
    .map(({ key }) => `${JSON.stringify(key)}: string`)
    .join(';\n')}
    }`
    : 'undefined';

  return `declare type ${ActionTypeDefinitionKey.EnvironmentVariables} = ${typeDefinition}`;
};

export const getEventTypeDefinition = (actionType: LogtoActionKey) => {
  switch (actionType) {
    case LogtoActionKey.PostFirstFactorVerification: {
      return `declare ${actionUserTypeDefinition}

declare ${postFirstFactorVerificationEventTypeDefinition}`;
    }
    case LogtoActionKey.PostSignIn: {
      return `declare ${jwtCustomizerUserContextTypeDefinition}

declare ${postSignInEventTypeDefinition}`;
    }
    case LogtoActionKey.PreRegister: {
      return `declare ${preRegisterUserTypeDefinition}

declare ${preRegisterEventTypeDefinition}`;
    }
  }
};

export const getResultTypeDefinition = (actionType: LogtoActionKey) => {
  switch (actionType) {
    case LogtoActionKey.PostFirstFactorVerification: {
      return `declare ${actionUserPatchTypeDefinition}

declare ${postFirstFactorVerificationResultTypeDefinition}`;
    }
    case LogtoActionKey.PostSignIn: {
      return `declare ${actionUserPatchTypeDefinition}

declare ${postSignInResultTypeDefinition}`;
    }
    case LogtoActionKey.PreRegister: {
      return `declare ${preRegisterResultTypeDefinition}`;
    }
  }
};
