import type { Model } from './MonacoCodeEditor/type.js';

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

export enum JwtTokenType {
  UserAccessToken = 'user-access-token',
  MachineToMachineAccessToken = 'm2m-access-token',
}
