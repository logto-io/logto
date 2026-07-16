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
 * Post first-factor verification hook.
 * Called after the first authentication factor is verified and before sign-in continues.
 *
 * @param {Payload} payload - The input argument of the function.
 *
 * @returns The hook result.
 */
const runInlineHook = async ({ event, environmentVariables }) => {
  // Write your custom logic here.

  return {
    action: 'updateUser',
    passwordVerified: true,
    user: {},
  };
};
`;

const defaultPostSignInScript = `/**
 * Post sign-in hook.
 * Called after a user signs in successfully.
 *
 * @param {Payload} payload - The input argument of the function.
 *
 * @returns The hook result.
 */
const runInlineHook = async ({ event, environmentVariables }) => {
  // Write your custom logic here.

  return {
    action: 'updateUser',
    user: {},
  };
};
`;

/**
 * Monaco type definitions for the script payload.
 * Only declare types (not the entry function) so user scripts can define
 * `const runInlineHook = ...` without a redeclaration conflict.
 */
const postFirstFactorVerificationDefinition = `
declare type Payload = {
  /**
   * Authentication event payload for the current first-factor verification.
   */
  event: ${InlineHookTypeDefinitionKey.PostFirstFactorVerificationEvent};
  /**
   * Custom environment variables configured for this hook.
   */
  environmentVariables: ${InlineHookTypeDefinitionKey.EnvironmentVariables};
};
`;

const postSignInDefinition = `
declare type Payload = {
  /**
   * Authentication event payload for the completed sign-in.
   */
  event: ${InlineHookTypeDefinitionKey.PostSignInEvent};
  /**
   * Custom environment variables configured for this hook.
   */
  environmentVariables: ${InlineHookTypeDefinitionKey.EnvironmentVariables};
};
`;

const buildSharedContextTypeDefinitions = () =>
  `declare ${hookUserTypeDefinition}

declare ${hookUserPatchTypeDefinition}`;

const postFirstFactorVerificationModel: ModelSettings = {
  name: 'post-first-factor-verification.js',
  // Display name for this hook; runtime entry remains `runInlineHook`.
  title: 'Post first-factor verification',
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
  // Display name for this hook; runtime entry remains `runInlineHook`.
  title: 'Post sign-in',
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

export const typeDefinitionCodeEditorOptions: EditorProps['options'] = {
  ...sampleCodeEditorOptions,
  folding: true,
};

export const fetchExternalDataCodeExample = `const response = await fetch('https://api.example.com/data', {
  headers: {
    Authorization: \`{{API KEY}}\`,
  }
});

const data = await response.json();

return {
  action: 'updateUser',
  user: {
    customData: {
      externalData: data,
    },
  },
};`;

export const environmentVariablesCodeExample = `/**
 * Access custom environment variables from the hook payload.
 *
 * @param {Payload} payload - The input argument of the function.
 */
const runInlineHook = async ({ environmentVariables }) => {
  const { apiKey } = environmentVariables;

  // Write your custom logic here.

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
