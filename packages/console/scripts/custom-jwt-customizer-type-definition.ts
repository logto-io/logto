/**
 * @fileoverview
 *
 * This file manually define some of the types that are used in the JWT customizer scripts.
 */

// eslint-disable-next-line unused-imports/no-unused-imports -- For type reference
import { JwtCustomizerApiContext } from '@logto/schemas';

/**
 * @returns {JwtCustomizerApiContext}
 */
export const jwtCustomizerApiContextTypeDefinition = `type JwtCustomizerApiContext = {
  /**
   * Reject the the current token exchange request.
   *
   * @remarks
   * By calling this function, the current token exchange request will be rejected,
   * and a ODIC AccessDenied error will be thrown to the client with the given message.
   *
   * @param message The message to be shown to the user.
   * @throws {ResponseError} with CustomJwtErrorBody
   */
  denyAccess: (message?: string) => never;
};`;
