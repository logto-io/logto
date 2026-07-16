import { LogtoInlineHookKey } from '@logto/schemas';

import { type InlineHookForm } from '../type';

export enum InlineHookTypeDefinitionKey {
  EnvironmentVariables = 'EnvironmentVariables',
  HookEvent = 'HookEvent',
  HookUser = 'HookUser',
  HookUserPatch = 'HookUserPatch',
  PostFirstFactorVerificationEvent = 'PostFirstFactorVerificationEvent',
  PostSignInEvent = 'PostSignInEvent',
  PostFirstFactorVerificationResult = 'PostFirstFactorVerificationResult',
  PostSignInResult = 'PostSignInResult',
  InlineHookPayload = 'InlineHookPayload',
}

export const hookUserTypeDefinition = `type ${InlineHookTypeDefinitionKey.HookUser} = {
  id: string;
  username: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  name: string | null;
  avatar: string | null;
  customData: Record<string, unknown>;
  profile: Record<string, unknown>;
};`;

export const hookUserPatchTypeDefinition = `type ${InlineHookTypeDefinitionKey.HookUserPatch} = {
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

export const postFirstFactorVerificationEventTypeDefinition = `type ${InlineHookTypeDefinitionKey.PostFirstFactorVerificationEvent} = {
  key: 'inlineHook.postFirstFactorVerification';
  interactionEvent: 'SignIn';
  verificationType: 'Password';
  identifier: {
    type: 'username' | 'email' | 'phone';
    value: string;
  };
  user: ${InlineHookTypeDefinitionKey.HookUser} | null;
  /**
   * Sensitive credential provided for inline hook controlled password verification.
   * Never log or persist this value outside the sandbox.
   */
  password: string;
};`;

export const postSignInEventTypeDefinition = `type ${InlineHookTypeDefinitionKey.PostSignInEvent} = {
  key: 'inlineHook.postSignIn';
  interactionEvent: 'SignIn';
  user: ${InlineHookTypeDefinitionKey.HookUser};
};`;

export const postFirstFactorVerificationResultTypeDefinition = `type ${InlineHookTypeDefinitionKey.PostFirstFactorVerificationResult} =
  | {
      action: 'createUser';
      user: ${InlineHookTypeDefinitionKey.HookUserPatch};
      passwordVerified: true;
    }
  | {
      action: 'updateUser';
      user: ${InlineHookTypeDefinitionKey.HookUserPatch};
      passwordVerified: true;
    };`;

export const postSignInResultTypeDefinition = `type ${InlineHookTypeDefinitionKey.PostSignInResult} = {
  action: 'updateUser';
  user?: ${InlineHookTypeDefinitionKey.HookUserPatch};
};`;

export const buildEnvironmentVariablesTypeDefinition = (
  envVariables?: InlineHookForm['environmentVariables']
) => {
  const typeDefinition = envVariables
    ? `{
  ${envVariables
    .filter(({ key }) => Boolean(key))
    .map(({ key }) => `${key}: string`)
    .join(';\n')}
    }`
    : 'undefined';

  return `declare type ${InlineHookTypeDefinitionKey.EnvironmentVariables} = ${typeDefinition}`;
};

export const getEventTypeDefinition = (hookType: LogtoInlineHookKey) => {
  switch (hookType) {
    case LogtoInlineHookKey.PostFirstFactorVerification: {
      return `declare ${hookUserTypeDefinition}

declare ${postFirstFactorVerificationEventTypeDefinition}`;
    }
    case LogtoInlineHookKey.PostSignIn: {
      return `declare ${hookUserTypeDefinition}

declare ${postSignInEventTypeDefinition}`;
    }
  }
};

export const getResultTypeDefinition = (hookType: LogtoInlineHookKey) => {
  switch (hookType) {
    case LogtoInlineHookKey.PostFirstFactorVerification: {
      return `declare ${hookUserPatchTypeDefinition}

declare ${postFirstFactorVerificationResultTypeDefinition}`;
    }
    case LogtoInlineHookKey.PostSignIn: {
      return `declare ${hookUserPatchTypeDefinition}

declare ${postSignInResultTypeDefinition}`;
    }
  }
};
