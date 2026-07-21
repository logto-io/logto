import {
  InteractionEvent,
  LogtoActionKey,
  SignInIdentifier,
  VerificationType,
  type ActionUser,
  type JwtCustomizerUserContext,
  type PostFirstFactorVerificationEvent,
  type PostSignInEvent,
} from '@logto/schemas';
import { type EditorProps } from '@monaco-editor/react';

import type { ModelSettings } from '@/components/MonacoCodeEditor';
import { jwtCustomizerUserContextTypeDefinition } from '@/consts/jwt-customizer-type-definition';

import {
  ActionTypeDefinitionKey,
  actionUserPatchTypeDefinition,
  actionUserTypeDefinition,
  postFirstFactorVerificationEventTypeDefinition,
  postFirstFactorVerificationResultTypeDefinition,
  postSignInEventTypeDefinition,
  postSignInResultTypeDefinition,
} from './type-definitions';

const defaultActionUser: ActionUser = {
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

const defaultPostSignInUser: JwtCustomizerUserContext = {
  ...defaultActionUser,
  identities: {},
  lastSignInAt: 1_704_067_200_000,
  createdAt: 1_704_067_200_000,
  updatedAt: 1_704_067_200_000,
  applicationId: 'app_123',
  isSuspended: false,
  hasPassword: true,
  ssoIdentities: [],
  mfaVerificationFactors: [],
  roles: [],
  organizations: [],
  organizationRoles: [],
};

const defaultPostFirstFactorVerificationEvent: PostFirstFactorVerificationEvent = {
  key: LogtoActionKey.PostFirstFactorVerification,
  interactionEvent: InteractionEvent.SignIn,
  verificationType: VerificationType.Password,
  identifier: {
    type: SignInIdentifier.Email,
    value: 'jane@example.com',
  },
  user: defaultActionUser,
  password: 'example-password',
};

const defaultPostSignInEvent: PostSignInEvent = {
  key: LogtoActionKey.PostSignIn,
  interactionEvent: InteractionEvent.SignIn,
  user: defaultPostSignInUser,
};

const defaultPostFirstFactorVerificationScript = `/**
 * Post first-factor verification action.
 * Called after the first authentication factor is verified and before sign-in continues.
 *
 * @param {Payload} payload - The input argument of the function.
 *
 * @returns The action result.
 */
const runAction = async ({ event, environmentVariables }) => {
  // Write your custom logic here.

  return {
    action: 'updateUser',
    passwordVerified: true,
    user: {},
  };
};
`;

const defaultPostSignInScript = `/**
 * Post sign-in action.
 * Called after a user signs in successfully.
 *
 * @param {Payload} payload - The input argument of the function.
 *
 * @returns The action result.
 */
const runAction = async ({ event, environmentVariables }) => {
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
 * `const runAction = ...` without a redeclaration conflict.
 */
const postFirstFactorVerificationDefinition = `
declare type Payload = {
  /**
   * Authentication event payload for the current first-factor verification.
   */
  event: ${ActionTypeDefinitionKey.PostFirstFactorVerificationEvent};
  /**
   * Custom environment variables configured for this action.
   */
  environmentVariables: ${ActionTypeDefinitionKey.EnvironmentVariables};
};
`;

const postSignInDefinition = `
declare type Payload = {
  /**
   * Authentication event payload for the completed sign-in.
   */
  event: ${ActionTypeDefinitionKey.PostSignInEvent};
  /**
   * Custom environment variables configured for this action.
   */
  environmentVariables: ${ActionTypeDefinitionKey.EnvironmentVariables};
};
`;

const buildSharedContextTypeDefinitions = (userTypeDefinition: string) =>
  `declare ${userTypeDefinition}

declare ${actionUserPatchTypeDefinition}`;

const postFirstFactorVerificationModel: ModelSettings = {
  name: 'post-first-factor-verification.js',
  // Display name for this action; runtime entry remains `runAction`.
  title: 'Post first-factor verification',
  language: 'typescript',
  defaultValue: defaultPostFirstFactorVerificationScript,
  extraLibs: [
    {
      content: postFirstFactorVerificationDefinition,
      filePath: 'file:///logto-action.d.ts',
    },
    {
      content: `${buildSharedContextTypeDefinitions(actionUserTypeDefinition)}

declare ${postFirstFactorVerificationEventTypeDefinition}

declare ${postFirstFactorVerificationResultTypeDefinition}`,
      filePath: 'file:///logto-action-context.d.ts',
    },
  ],
};

const postSignInModel: ModelSettings = {
  name: 'post-sign-in.js',
  // Display name for this action; runtime entry remains `runAction`.
  title: 'Post sign-in',
  language: 'typescript',
  defaultValue: defaultPostSignInScript,
  extraLibs: [
    {
      content: postSignInDefinition,
      filePath: 'file:///logto-action.d.ts',
    },
    {
      content: `${buildSharedContextTypeDefinitions(jwtCustomizerUserContextTypeDefinition)}

declare ${postSignInEventTypeDefinition}

declare ${postSignInResultTypeDefinition}`,
      filePath: 'file:///logto-action-context.d.ts',
    },
  ],
};

export const getActionModel = (actionType: LogtoActionKey): ModelSettings => {
  switch (actionType) {
    case LogtoActionKey.PostFirstFactorVerification: {
      return postFirstFactorVerificationModel;
    }
    case LogtoActionKey.PostSignIn: {
      return postSignInModel;
    }
  }
};

export const getDefaultScript = (actionType: LogtoActionKey) =>
  getActionModel(actionType).defaultValue ?? '';

export const getDefaultContextSample = (actionType: LogtoActionKey) => {
  switch (actionType) {
    case LogtoActionKey.PostFirstFactorVerification: {
      return defaultPostFirstFactorVerificationEvent;
    }
    case LogtoActionKey.PostSignIn: {
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
 * Access custom environment variables from the action payload.
 *
 * @param {Payload} payload - The input argument of the function.
 */
const runActionSample = async ({ environmentVariables }) => {
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
