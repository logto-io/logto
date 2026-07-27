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
   * Never log or persist this value outside the sandbox.
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
  }
};
