import { type EditorProps } from '@monaco-editor/react';

import type { Model } from './MonacoCodeEditor/type.js';

/**
 * JWT token types
 */
export enum JwtTokenType {
  UserAccessToken = 'user-access-token',
  MachineToMachineAccessToken = 'm2m-access-token',
}

/**
 * JWT token code editor configuration
 */
const userJwtGlobalDeclarations = `
declare global {
  export interface CustomJwtClaims extends Record<string, any> {}

  /** The user info associated with the token. 
   * 
   * @param {string} id - The user id
   * @param {string} [primaryEmail] - The user email
   * @param {string} [primaryPhone] - The user phone
   * @param {string} [username] - The user username
   * @param {string} [name] - The user name
   * @param {string} [avatar] - The user avatar
   * 
  */
  export type User = {
    id: string;
    primaryEmail?: string;
    primaryPhone?: string;
    username?: string;
    name?: string;
    avatar?: string;
  }

  /** Logto internal data that can be used to pass additional information
   * @param {User} user - The user info associated with the token.
   */
  export type Data = {
    user: User;
  }

  export interface Exports {
    /**
     * This function is called to get custom claims for the JWT token.
     * 
     * @param {string} token -The JWT token.
     * @param {Data} data - Logto internal data that can be used to pass additional information
     * @param {User} data.user - The user info associated with the token.
     * 
     * @returns The custom claims.
     */
    getCustomJwtClaims: (token: string, data: Data) => Promise<CustomJwtClaims>;
  }

  const exports: Exports;
}

export { exports as default };
`;

const machineToMachineJwtGlobalDeclarations = `
declare global {
  export interface CustomJwtClaims extends Record<string, any> {}

  export interface Exports {
    /**
     * This function is called to get custom claims for the JWT token.
     * 
     * @param {string} token -The JWT token.
     * 
     * @returns The custom claims.
     */
    getCustomJwtClaims: (token: string) => Promise<CustomJwtClaims>;
  }

  const exports: Exports;
}

export { exports as default };
`;

const defaultUserJwtClaimsCode = `/**
* This function is called to get custom claims for the JWT token.
* 
* @param {string} token -The JWT token.
* @param {Data} data - Logto internal data that can be used to pass additional information
* @param {User} data.user - The user info associated with the token.
*
* @returns The custom claims.
*/

exports.getCustomJwtClaims = async (token, data) => {
  return {};
}`;

const defaultMachineToMachineJwtClaimsCode = `/**
* This function is called to get custom claims for the JWT token.
*
* @param {string} token -The JWT token.
*
* @returns The custom claims.
*/

exports.getCustomJwtClaims = async (token) => {
  return {};
}`;

export const userJwtFile: Model = {
  name: 'user-jwt.ts',
  title: 'TypeScript',
  language: 'typescript',
  defaultValue: defaultUserJwtClaimsCode,
  globalDeclarations: userJwtGlobalDeclarations,
};

export const machineToMachineJwtFile: Model = {
  name: 'machine-to-machine-jwt.ts',
  title: 'TypeScript',
  language: 'typescript',
  defaultValue: defaultMachineToMachineJwtClaimsCode,
  globalDeclarations: machineToMachineJwtGlobalDeclarations,
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
    value: 'iss',
    description: '(issuer) Issuer of the JWT.',
  },
  {
    value: 'sub',
    description: '(subject) Subject of the JWT.',
  },
  {
    value: 'aud',
    description: '(audience) Recipient for which the JWT is intended.',
  },
  {
    value: 'exp',
    description: '(expiration) Time after which the JWT expires.',
  },
  {
    value: 'nbf',
    description: '(not before) Time before which the JWT must not be accepted for processing.',
  },
  {
    value: 'iat',
    description: '(issued at) Time at which the JWT was issued.',
  },
  {
    value: 'jti',
    description:
      '(JWT ID) Unique identifier for the JWT. Useful for tracking and preventing reuse of the token.',
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

export const fetchExternalDataExample = `const response = await fetch('https://api.example.com/data', {
  headers: {
    Authorization: \`{{API KEY}}\`,
  }
});

const data = await response.json();

return {
  externalData: data,
};`;
