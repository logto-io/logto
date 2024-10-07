/**
 * @fileoverview
 *
 * This file manually define some of the types that are used in the JWT customizer scripts.
 */

// eslint-disable-next-line unused-imports/no-unused-imports -- For type reference
import { CustomJwtApiContext } from '@logto/schemas';

/**
 * @returns {CustomJwtApiContext}
 */
export const jwtCustomizerApiContextTypeDefinition = `type CustomJwtApiContext = {
  /**
   * Reject the the current token request.
   *
   * @remarks
   * This function will reject the current token request and throw
   * an OIDC AccessDenied error to the client.
   *
   * @param {string} [message] - The custom error message.
   */
  denyAccess: (message?: string) => never;
};`;
