import {
  GrantType,
  type AccessTokenPayload,
  type ClientCredentialsPayload,
  type JwtCustomizerUserContext,
  type JwtCustomizerGrantContext,
  type JwtCustomizerUserInteractionContext,
  InteractionEvent,
} from '@logto/schemas';
import { type EditorProps } from '@monaco-editor/react';
import { conditional } from '@silverhand/essentials';

import TokenFileIcon from '@/assets/icons/token-file-icon.svg?react';
import UserFileIcon from '@/assets/icons/user-file-icon.svg?react';
import { isDevFeaturesEnabled } from '@/consts/env.js';

import type { ModelSettings } from '../MainContent/MonacoCodeEditor/type.js';

import {
  JwtCustomizerTypeDefinitionKey,
  buildAccessTokenJwtCustomizerContextTsDefinition,
  buildClientCredentialsJwtCustomizerContextTsDefinition,
} from './type-definitions.js';

/**
 * Define the user access token JwtCustomizer payload type definitions
 *
 * @see {CustomJwtScriptPayload}
 */
const accessTokenJwtCustomizerDefinition = `
declare interface CustomJwtClaims extends Record<string, any> {}

/** Logto internal data that can be used to pass additional information
 * 
 * @param {${JwtCustomizerTypeDefinitionKey.JwtCustomizerUserContext}} user - The user info associated with the token.
 * @param {${JwtCustomizerTypeDefinitionKey.JwtCustomizerGrantContext}} [grant] - The grant context associated with the token.
 * @param {${JwtCustomizerTypeDefinitionKey.JwtCustomizerUserInteractionContext}} [interaction] - The user interaction context associated with the token.
 */
declare type Context = {
  /**
   * The user data associated with the token.
   */
  user: ${JwtCustomizerTypeDefinitionKey.JwtCustomizerUserContext};
  /**
   * The grant context associated with the token.
   */
  grant?: ${JwtCustomizerTypeDefinitionKey.JwtCustomizerGrantContext};
  /**
   * The user interaction context associated with the token.
   */
  interaction?: ${JwtCustomizerTypeDefinitionKey.JwtCustomizerUserInteractionContext};
}

declare type Payload = {
  /**
   * Token payload.
   */
  token: ${JwtCustomizerTypeDefinitionKey.AccessTokenPayload};
  /**
   * Logto internal data that can be used to pass additional information.
   *
   * @params {${JwtCustomizerTypeDefinitionKey.JwtCustomizerUserContext}} user
   * @params {${JwtCustomizerTypeDefinitionKey.JwtCustomizerGrantContext}} [grant]
   * @params {${JwtCustomizerTypeDefinitionKey.JwtCustomizerUserInteractionContext}} [interaction]
   */
  context: Context;
  /**
   * Custom environment variables.
   */
  environmentVariables: ${JwtCustomizerTypeDefinitionKey.EnvironmentVariables};
  /**
   * Logto API context, provides callback methods for access control.
   *
   * @param {${JwtCustomizerTypeDefinitionKey.CustomJwtApiContext}} api
   */
  api: ${JwtCustomizerTypeDefinitionKey.CustomJwtApiContext};
};`;

/**
 * Define the client credentials token JwtCustomizer payload type definitions
 *
 * @see {CustomJwtScriptPayload}
 */
const clientCredentialsJwtCustomizerDefinition = `
declare interface CustomJwtClaims extends Record<string, any> {}

declare type Payload = {
  /**
   * Token payload.
   */
  token: ${JwtCustomizerTypeDefinitionKey.AccessTokenPayload};
  /**
   * Custom environment variables.
   */
  environmentVariables: ${JwtCustomizerTypeDefinitionKey.EnvironmentVariables};
  /**
   * Logto API context, callback methods for access control.
   *
   * @param {${JwtCustomizerTypeDefinitionKey.CustomJwtApiContext}} api
   */
  api: ${JwtCustomizerTypeDefinitionKey.CustomJwtApiContext};
};`;

export const defaultAccessTokenJwtCustomizerCode = `/**
 * This function is called during the access token generation process to get custom claims for the access token.
 * Limit custom claims to under 50KB.
 *
 * @param {Payload} payload - The input argument of the function.
 * 
 * @returns The custom claims.
 */
const getCustomJwtClaims = async ({ token, context, environmentVariables, api }) => {
  return {};
}`;

export const defaultClientCredentialsJwtCustomizerCode = `/**
 * This function is called during the access token generation process to get custom claims for the access token.
 * Limit custom claims to under 50KB.
 *
 * @param {Payload} payload - The input payload of the function.
 *
 * @returns The custom claims.
 */
const getCustomJwtClaims = async ({ token, environmentVariables, api }) => {
  return {};
}`;

export const accessTokenJwtCustomizerModel: ModelSettings = {
  name: 'user-jwt.js',
  title: 'User access token',
  language: 'typescript',
  defaultValue: defaultAccessTokenJwtCustomizerCode,
  extraLibs: [
    {
      content: accessTokenJwtCustomizerDefinition,
      filePath: `file:///logto-jwt-customizer.d.ts`,
    },
    {
      content: buildAccessTokenJwtCustomizerContextTsDefinition(),
      filePath: `file:///logto-jwt-customizer-context.d.ts`,
    },
  ],
};

export const clientCredentialsModel: ModelSettings = {
  name: 'machine-to-machine-jwt.js',
  title: 'Machine-to-machine token',
  language: 'typescript',
  defaultValue: defaultClientCredentialsJwtCustomizerCode,
  extraLibs: [
    {
      content: clientCredentialsJwtCustomizerDefinition,
      filePath: `file:///logto-jwt-customizer.d.ts`,
    },
    {
      content: buildClientCredentialsJwtCustomizerContextTsDefinition(),
      filePath: `file:///logto-jwt-customizer-context.d.ts`,
    },
  ],
};

/**
 * JWT claims guide card configs
 */
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
  externalData: data,
};`;

export const environmentVariablesCodeExample = `const getCustomJwtClaimsSample = async ({ environmentVariables }) => {
  const { apiKey } = environmentVariables;

  const response = await fetch('https://api.example.com/data', {
    headers: {
      Authorization: apiKey,
    }
  });

  const data = await response.json();

  return {
    externalData: data,
  };
};`;

export const denyAccessCodeExample = `/**
 * @param {Payload} payload - The input payload of the function.
 */
getCustomJwtClaims = async ({ api }) => {
  // Conditionally deny access 
  return api.denyAccess('Access denied');
};`;

/**
 * Tester Code Editor configs
 */
const standardTokenPayloadData = {
  jti: 'f1d3d2d1-1f2d-3d4e-5d6f-7d8a9d0e1d2',
  aud: 'http://localhost:3000/api/test',
  scope: 'read write',
  clientId: 'my_app',
};

export const defaultAccessTokenPayload: AccessTokenPayload = {
  ...standardTokenPayloadData,
  accountId: 'uid_123',
  grantId: 'grant_123',
  gty: 'authorization_code',
  kind: 'AccessToken',
};

export const defaultClientCredentialsPayload: ClientCredentialsPayload = {
  ...standardTokenPayloadData,
  kind: 'ClientCredentials',
};

const defaultUserContext: Partial<JwtCustomizerUserContext> = {
  id: '123',
  hasPassword: false,
  username: 'foo',
  primaryEmail: 'foo@logto.io',
  primaryPhone: '+1234567890',
  name: 'Foo Bar',
  avatar: 'https://example.com/avatar.png',
  customData: {},
  identities: {},
  profile: {},
  applicationId: 'my-app',
  ssoIdentities: [],
  mfaVerificationFactors: [],
  roles: [],
  organizations: [],
  organizationRoles: [],
};

const defaultGrantContext: Partial<JwtCustomizerGrantContext> = {
  type: GrantType.TokenExchange,
  subjectTokenContext: {
    foo: 'bar',
  },
};

const defaultUserInteractionContext: Partial<JwtCustomizerUserInteractionContext> = {
  interactionEvent: InteractionEvent.SignIn,
  userId: '123',
};

export const defaultUserTokenContextData = {
  user: defaultUserContext,
  grant: defaultGrantContext,
  ...conditional(isDevFeaturesEnabled && { interaction: defaultUserInteractionContext }),
};

export const accessTokenPayloadTestModel: ModelSettings = {
  language: 'json',
  icon: <TokenFileIcon />,
  name: 'user-token-payload.json',
  title: 'Token data',
  defaultValue: JSON.stringify(defaultAccessTokenPayload, null, 2),
};

export const clientCredentialsPayloadTestModel: ModelSettings = {
  language: 'json',
  icon: <TokenFileIcon />,
  name: 'machine-to-machine-token-payload.json',
  title: 'Token data',
  defaultValue: JSON.stringify(defaultClientCredentialsPayload, null, 2),
};

export const userContextTestModel: ModelSettings = {
  language: 'json',
  icon: <UserFileIcon />,
  name: 'user-token-context.json',
  title: 'Context data',
  defaultValue: JSON.stringify(defaultUserTokenContextData, null, 2),
};
