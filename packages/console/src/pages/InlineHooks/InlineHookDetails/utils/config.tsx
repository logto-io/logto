import {
  InteractionEvent,
  LogtoInlineHookKey,
  SignInIdentifier,
  VerificationType,
  type PostFirstFactorVerificationEvent,
  type PostSignInEvent,
} from '@logto/schemas';
import { type EditorProps } from '@monaco-editor/react';

import type { ModelSettings } from '@/components/MonacoCodeEditor';

import {
  InlineHookTypeDefinitionKey,
  hookUserPatchTypeDefinition,
  hookUserTypeDefinition,
  postFirstFactorVerificationEventTypeDefinition,
  postFirstFactorVerificationResultTypeDefinition,
  postSignInEventTypeDefinition,
  postSignInResultTypeDefinition,
} from './type-definitions';

const defaultHookUser = {
  id: 'user_123',
  username: 'jane',
  primaryEmail: 'jane@example.com',
  primaryPhone: '+15555550123',
  name: 'Jane Doe',
  avatar: 'https://example.com/avatar.png',
  customData: {
    plan: 'pro',
  },
  profile: {
    familyName: 'Doe',
    givenName: 'Jane',
  },
};

const defaultPostFirstFactorVerificationEvent: PostFirstFactorVerificationEvent = {
  key: LogtoInlineHookKey.PostFirstFactorVerification,
  interactionEvent: InteractionEvent.SignIn,
  verificationType: VerificationType.Password,
  identifier: {
    type: SignInIdentifier.Email,
    value: 'jane@example.com',
  },
  user: defaultHookUser,
  password: 'example-password',
};

const defaultPostSignInEvent: PostSignInEvent = {
  key: LogtoInlineHookKey.PostSignIn,
  interactionEvent: InteractionEvent.SignIn,
  user: defaultHookUser,
};

const defaultPostFirstFactorVerificationScript = `/**
 * Runs after the first authentication factor is verified and before sign-in continues.
 *
 * @param {${InlineHookTypeDefinitionKey.InlineHookPayload}} payload
 * @returns {Promise<${InlineHookTypeDefinitionKey.PostFirstFactorVerificationResult}> | ${InlineHookTypeDefinitionKey.PostFirstFactorVerificationResult}}
 */
const runInlineHook = async ({ event, environmentVariables }) => {
  // Example: create a user when the identifier is unknown to Logto.
  if (!event.user) {
    return {
      action: 'createUser',
      passwordVerified: true,
      user: {
        primaryEmail: event.identifier.type === 'email' ? event.identifier.value : undefined,
        username: event.identifier.type === 'username' ? event.identifier.value : undefined,
        primaryPhone: event.identifier.type === 'phone' ? event.identifier.value : undefined,
        name: 'Provisioned user',
      },
    };
  }

  // Example: enrich the existing user profile.
  return {
    action: 'updateUser',
    passwordVerified: true,
    user: {
      name: event.user.name ?? 'Updated user',
      customData: {
        ...event.user.customData,
        lastVerifiedBy: 'inline-hook',
      },
    },
  };
};
`;

const defaultPostSignInScript = `/**
 * Runs after a user signs in successfully.
 *
 * @param {${InlineHookTypeDefinitionKey.InlineHookPayload}} payload
 * @returns {Promise<${InlineHookTypeDefinitionKey.PostSignInResult}> | ${InlineHookTypeDefinitionKey.PostSignInResult}}
 */
const runInlineHook = async ({ event, environmentVariables }) => {
  return {
    action: 'updateUser',
    user: {
      customData: {
        ...event.user.customData,
        lastSignedInAt: new Date().toISOString(),
      },
    },
  };
};
`;

const postFirstFactorVerificationDefinition = `
declare type ${InlineHookTypeDefinitionKey.InlineHookPayload} = {
  /**
   * Authentication event payload for the current first-factor verification.
   */
  event: ${InlineHookTypeDefinitionKey.PostFirstFactorVerificationEvent};
  /**
   * Custom environment variables configured for this hook.
   */
  environmentVariables: ${InlineHookTypeDefinitionKey.EnvironmentVariables};
};

/**
 * Entry point invoked by the Logto inline hook runtime.
 *
 * @param {${InlineHookTypeDefinitionKey.InlineHookPayload}} payload
 * @returns {Promise<${InlineHookTypeDefinitionKey.PostFirstFactorVerificationResult}> | ${InlineHookTypeDefinitionKey.PostFirstFactorVerificationResult}}
 */
declare function runInlineHook(
  payload: ${InlineHookTypeDefinitionKey.InlineHookPayload}
):
  | Promise<${InlineHookTypeDefinitionKey.PostFirstFactorVerificationResult}>
  | ${InlineHookTypeDefinitionKey.PostFirstFactorVerificationResult};
`;

const postSignInDefinition = `
declare type ${InlineHookTypeDefinitionKey.InlineHookPayload} = {
  /**
   * Authentication event payload for the completed sign-in.
   */
  event: ${InlineHookTypeDefinitionKey.PostSignInEvent};
  /**
   * Custom environment variables configured for this hook.
   */
  environmentVariables: ${InlineHookTypeDefinitionKey.EnvironmentVariables};
};

/**
 * Entry point invoked by the Logto inline hook runtime.
 *
 * @param {${InlineHookTypeDefinitionKey.InlineHookPayload}} payload
 * @returns {Promise<${InlineHookTypeDefinitionKey.PostSignInResult}> | ${InlineHookTypeDefinitionKey.PostSignInResult}}
 */
declare function runInlineHook(
  payload: ${InlineHookTypeDefinitionKey.InlineHookPayload}
): Promise<${InlineHookTypeDefinitionKey.PostSignInResult}> | ${InlineHookTypeDefinitionKey.PostSignInResult};
`;

const buildSharedContextTypeDefinitions = () =>
  `declare ${hookUserTypeDefinition}

declare ${hookUserPatchTypeDefinition}`;

const postFirstFactorVerificationModel: ModelSettings = {
  name: 'post-first-factor-verification.js',
  title: 'runInlineHook',
  language: 'typescript',
  defaultValue: defaultPostFirstFactorVerificationScript,
  extraLibs: [
    {
      content: postFirstFactorVerificationDefinition,
      filePath: 'file:///logto-inline-hook.d.ts',
    },
    {
      content: `${buildSharedContextTypeDefinitions()}

declare ${postFirstFactorVerificationEventTypeDefinition}

declare ${postFirstFactorVerificationResultTypeDefinition}`,
      filePath: 'file:///logto-inline-hook-context.d.ts',
    },
  ],
};

const postSignInModel: ModelSettings = {
  name: 'post-sign-in.js',
  title: 'runInlineHook',
  language: 'typescript',
  defaultValue: defaultPostSignInScript,
  extraLibs: [
    {
      content: postSignInDefinition,
      filePath: 'file:///logto-inline-hook.d.ts',
    },
    {
      content: `${buildSharedContextTypeDefinitions()}

declare ${postSignInEventTypeDefinition}

declare ${postSignInResultTypeDefinition}`,
      filePath: 'file:///logto-inline-hook-context.d.ts',
    },
  ],
};

export const getInlineHookModel = (hookType: LogtoInlineHookKey): ModelSettings => {
  switch (hookType) {
    case LogtoInlineHookKey.PostFirstFactorVerification: {
      return postFirstFactorVerificationModel;
    }
    case LogtoInlineHookKey.PostSignIn: {
      return postSignInModel;
    }
  }
};

export const getDefaultScript = (hookType: LogtoInlineHookKey) =>
  getInlineHookModel(hookType).defaultValue ?? '';

export const getDefaultContextSample = (hookType: LogtoInlineHookKey) => {
  switch (hookType) {
    case LogtoInlineHookKey.PostFirstFactorVerification: {
      return defaultPostFirstFactorVerificationEvent;
    }
    case LogtoInlineHookKey.PostSignIn: {
      return defaultPostSignInEvent;
    }
  }
};

export const sampleCodeEditorOptions: EditorProps['options'] = {
  readOnly: true,
  wordWrap: 'on',
  minimap: { enabled: false },
  renderLineHighlight: 'none',
  fontSize: 14,
  padding: { top: 16, bottom: 16 },
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  lineNumbers: 'off',
  folding: false,
  tabSize: 2,
  scrollBeyondLastLine: false,
};

export const environmentVariablesCodeExample = `const runInlineHook = async ({ environmentVariables }) => {
  const { apiKey } = environmentVariables;

  const response = await fetch('https://api.example.com/data', {
    headers: {
      Authorization: apiKey,
    },
  });

  const data = await response.json();

  return {
    action: 'updateUser',
    user: {
      customData: {
        externalData: data,
      },
    },
  };
};`;
