import { type EditorProps } from '@monaco-editor/react';

import TokenFileIcon from '@/assets/icons/token-file-icon.svg';
import UserFileIcon from '@/assets/icons/user-file-icon.svg';

import type { ModelSettings } from '../MonacoCodeEditor/type.js';

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
     * This function is called to get custom claims for the JWT token.
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
     * This function is called to get custom claims for the JWT token.
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

const defaultAccessTokenJwtCustomizerCode = `/**
* This function is called to get custom claims for the JWT token.
* 
* @param {${JwtCustomizerTypeDefinitionKey.AccessTokenPayload}} token -The JWT token.
* @param {Data} data - Logto internal data that can be used to pass additional information
* @param {${JwtCustomizerTypeDefinitionKey.JwtCustomizerUserContext}} data.user - The user info associated with the token.
* @param {${JwtCustomizerTypeDefinitionKey.EnvironmentVariables}} [envVariables] - The environment variables.
*
* @returns The custom claims.
*/

exports.getCustomJwtClaims = async (token, data) => {
  return {};
}`;

const defaultClientCredentialsJwtCustomizerCode = `/**
* This function is called to get custom claims for the JWT token.
*
* @param {${JwtCustomizerTypeDefinitionKey.ClientCredentialsPayload}} token -The JWT token.
* @param {${JwtCustomizerTypeDefinitionKey.EnvironmentVariables}} [envVariables] - The environment variables.
*
* @returns The custom claims.
*/

exports.getCustomJwtClaims = async (token) => {
  return {};
}`;

export const accessTokenJwtCustomizerModel: ModelSettings = {
  name: 'user-jwt.ts',
  title: 'TypeScript',
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
  title: 'TypeScript',
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
// TODO: align user properties and then i18n the descriptions
type GuideTableData = {
  value: string;
  description: string;
};

export const userDataDescription: GuideTableData[] = [
  {
    value: 'user.id',
    description: 'Unique identifier of the user.',
  },
  {
    value: 'user.username',
    description: 'Username for sign-in',
  },
  {
    value: 'user.primary_email',
    description: 'Primary email address of the user.',
  },
  {
    value: 'user.primary_phone',
    description: 'Primary phone number of the user.',
  },
  {
    value: 'user.name',
    description: 'Full name of the user.',
  },
  {
    value: 'user.avatar',
    description: "URL pointing to user's avatar image	",
  },
  {
    value: 'user.identities',
    description: 'User info retrieved from social sign-in',
  },
  {
    value: 'user.custom_data',
    description: 'Additional info in customizable properties	',
  },
];

export const tokenDataDescription: GuideTableData[] = [
  {
    value: 'jti',
    description:
      '(JWT ID) Unique identifier for the JWT. Useful for tracking and preventing reuse of the token.',
  },
  {
    value: 'iat',
    description: '(issued at) Time at which the JWT was issued.',
  },
  {
    value: 'exp',
    description: '(expiration) Time after which the JWT expires.',
  },
  {
    value: 'client_id',
    description: 'Client ID of the application that requested the JWT.',
  },
  {
    value: 'kind',
    description:
      'Type of the token. `AccessToken` for user access tokens and `ClientCredentials` for machine-to-machine access tokens.',
  },
  {
    value: 'scope',
    description: 'Scopes requested by the client joint by space.',
  },
  {
    value: 'aud',
    description: '(audience) Audience for which the JWT is intended.',
  },
];

export const fetchExternalDataEditorOptions: EditorProps['options'] = {
  readOnly: true,
  wordWrap: 'on',
  minimap: { enabled: false },
  renderLineHighlight: 'none',
  fontSize: 14,
  padding: { top: 16, bottom: 16 },
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  lineNumbers: 'off',
  scrollbar: { vertical: 'hidden', horizontal: 'hidden', handleMouseWheel: false },
  folding: false,
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

/**
 * Tester Code Editor configs
 */
const standardTokenPayloadData = {
  jti: '1234567890',
  iat: 1_516_239_022,
  exp: 1_516_239_022,
  client_id: 'my_app',
  scope: 'read write',
  aud: 'http://localhost:3000/api',
};

const defaultUserTokenPayloadData = {
  ...standardTokenPayloadData,
  kind: 'AccessToken',
};

const defaultMachineToMachineTokenPayloadData = {
  ...standardTokenPayloadData,
  kind: 'ClientCredentials',
};

const defaultUserTokenContextData = {
  user: {
    id: '123',
    primaryEmail: 'foo@logto.io',
    primaryPhone: '+1234567890',
    username: 'foo',
    name: 'Foo Bar',
    avatar: 'https://example.com/avatar.png',
    identities: {},
    customData: {},
  },
};

export const userTokenPayloadTestModel: ModelSettings = {
  language: 'json',
  icon: <TokenFileIcon />,
  name: 'user-token-payload.json',
  title: 'Token',
  defaultValue: JSON.stringify(defaultUserTokenPayloadData, null, '\t'),
};

export const machineToMachineTokenPayloadTestModel: ModelSettings = {
  language: 'json',
  icon: <TokenFileIcon />,
  name: 'machine-to-machine-token-payload.json',
  title: 'Token',
  defaultValue: JSON.stringify(defaultMachineToMachineTokenPayloadData, null, '\t'),
};

export const userTokenContextTestModel: ModelSettings = {
  language: 'json',
  icon: <UserFileIcon />,
  name: 'user-token-context.json',
  title: 'User Context',
  defaultValue: JSON.stringify(defaultUserTokenContextData, null, '\t'),
};
