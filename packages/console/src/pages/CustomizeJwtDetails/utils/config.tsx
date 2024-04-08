import type {
  AccessTokenPayload,
  ClientCredentialsPayload,
  JwtCustomizerUserContext,
} from '@logto/schemas';
import { type EditorProps } from '@monaco-editor/react';

import TokenFileIcon from '@/assets/icons/token-file-icon.svg';
import UserFileIcon from '@/assets/icons/user-file-icon.svg';

import type { ModelSettings } from '../MainContent/MonacoCodeEditor/type.js';

import {
  JwtCustomizerTypeDefinitionKey,
  buildAccessTokenJwtCustomizerContextTsDefinition,
  buildClientCredentialsJwtCustomizerContextTsDefinition,
} from './type-definitions.js';

/**
 * JWT token code editor configuration
 */
const accessTokenJwtCustomizerDefinition = `
declare global {
  export interface CustomJwtClaims extends Record<string, any> {}

  /** Logto internal data that can be used to pass additional information
   * @param {${JwtCustomizerTypeDefinitionKey.JwtCustomizerUserContext}} user - The user info associated with the token.
   */
  export type Data = {
    user: ${JwtCustomizerTypeDefinitionKey.JwtCustomizerUserContext};
  }

  export interface Exports {
    /**
     * This function is called during the access token generation process to get custom claims for the JWT token.
     * 
     * @param {${JwtCustomizerTypeDefinitionKey.AccessTokenPayload}} token -The JWT token.
     * @param {Data} data - Logto internal data that can be used to pass additional information
     * @param {${JwtCustomizerTypeDefinitionKey.JwtCustomizerUserContext}} data.user - The user info associated with the token.
     * @param {${JwtCustomizerTypeDefinitionKey.EnvironmentVariables}} envVariables - The environment variables.
     * 
     * @returns The custom claims.
     */
    getCustomJwtClaims: (token: ${JwtCustomizerTypeDefinitionKey.AccessTokenPayload}, data: Data, envVariables: ${JwtCustomizerTypeDefinitionKey.EnvironmentVariables}) => Promise<CustomJwtClaims>;
  }

  const exports: Exports;
}

export { exports as default };
`;

const clientCredentialsJwtCustomizerDefinition = `
declare global {
  export interface CustomJwtClaims extends Record<string, any> {}

  export interface Exports {
    /**
     * This function is called during the access token generation process to get custom claims for the JWT token.
     * 
     * @param {${JwtCustomizerTypeDefinitionKey.ClientCredentialsPayload}} token -The JWT token.
     * 
     * @returns The custom claims.
     */
    getCustomJwtClaims: (token: ${JwtCustomizerTypeDefinitionKey.ClientCredentialsPayload}, envVariables: ${JwtCustomizerTypeDefinitionKey.EnvironmentVariables}) => Promise<CustomJwtClaims>;
  }

  const exports: Exports;
}

export { exports as default };
`;

export const defaultAccessTokenJwtCustomizerCode = `/**
* This function is called during the access token generation process to get custom claims for the JWT token.
* Limit custom claims to under 50KB.
* 
* @param {${JwtCustomizerTypeDefinitionKey.AccessTokenPayload}} token -The JWT token.
* @param {Data} data - Logto internal data that can be used to pass additional information
* @param {${JwtCustomizerTypeDefinitionKey.JwtCustomizerUserContext}} data.user - The user info associated with the token.
* @param {${JwtCustomizerTypeDefinitionKey.EnvironmentVariables}} [envVariables] - The environment variables.
*
* @returns The custom claims.
*/

exports.getCustomJwtClaims = async (token, data, envVariables) => {
  return {};
}`;

export const defaultClientCredentialsJwtCustomizerCode = `/**
* This function is called during the access token generation process to get custom claims for the JWT token.
* Limit custom claims to under 50KB.
*
* @param {${JwtCustomizerTypeDefinitionKey.ClientCredentialsPayload}} token -The JWT token.
* @param {${JwtCustomizerTypeDefinitionKey.EnvironmentVariables}} [envVariables] - The environment variables.
*
* @returns The custom claims.
*/

exports.getCustomJwtClaims = async (token, envVariables) => {
  return {};
}`;

export const accessTokenJwtCustomizerModel: ModelSettings = {
  name: 'user-jwt.ts',
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
  name: 'machine-to-machine-jwt.ts',
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

export const environmentVariablesCodeExample = `exports.getCustomJwtClaims = async (token, data, envVariables) => {
  const { apiKey } = envVariables;

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

export const defaultUserTokenContextData = {
  user: defaultUserContext,
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
  title: 'User data',
  defaultValue: JSON.stringify(defaultUserTokenContextData, null, 2),
};
