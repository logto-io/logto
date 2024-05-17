import { removeUndefinedKeys } from '@silverhand/essentials';
import snakecaseKeys from 'snakecase-keys';

import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { generateStandardId } from '@logto/shared/universal';
import { SignJWT } from 'jose';
import ky, { HTTPError } from 'ky';

import { TokenEndpointAuthMethod } from './types.js';

type TokenEndpointAuthOptions<T extends TokenEndpointAuthMethod = TokenEndpointAuthMethod> =
  T extends TokenEndpointAuthMethod.ClientSecretJwt
    ? {
        method: TokenEndpointAuthMethod.ClientSecretJwt;
        clientSecretJwtSigningAlgorithm: string;
      }
    : {
        method:
          | TokenEndpointAuthMethod.ClientSecretBasic
          | TokenEndpointAuthMethod.ClientSecretPost;
      };

export type RequestTokenEndpointOptions = {
  tokenEndpoint: string;
  tokenEndpointAuthOptions: TokenEndpointAuthOptions;
  tokenRequestBody: {
    grantType: string;
    code: string;
    redirectUri: string;
    clientId: string;
    clientSecret: string;
  } & Record<string, string>;
  timeout?: number;
};

/**
 * Requests the token endpoint for an access token with given client authentication options.
 *
 * @param tokenEndpoint - The URL of the token endpoint.
 * @param clientCredentials - The client credentials (client ID and client secret).
 * @param tokenEndpointAuthOptions - The options for authenticating with the token endpoint.
 * @param tokenEndpointAuthOptions.method - The method to use for authenticating with the token endpoint.
 * @param tokenEndpointAuthOptions.clientSecretJwtSigningAlgorithm - The signing algorithm to use for the client secret JWT. Required if the `method` is `TokenEndpointAuthMethod.ClientSecretJwt`.
 * @param tokenRequestBody - The request body to be sent as application/x-www-form-urlencoded to the token endpoint. Parameters are automatically converted to snake_case and undefined values are removed.
 * @param timeout - The timeout for the request in milliseconds.
 * @returns A Promise that resolves to the response from the token endpoint.
 */
export const requestTokenEndpoint = async ({
  tokenEndpoint,
  tokenEndpointAuthOptions,
  tokenRequestBody,
  timeout,
}: RequestTokenEndpointOptions) => {
  const postTokenEndpoint = async ({
    form,
    headers,
  }: {
    form: Record<string, string>;
    headers?: Record<string, string>;
  }) => {
    try {
      return await ky.post(tokenEndpoint, {
        headers,
        body: new URLSearchParams(removeUndefinedKeys(snakecaseKeys(form))),
        timeout,
      });
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        throw new ConnectorError(ConnectorErrorCodes.General, JSON.stringify(error.response.body));
      }

      throw error;
    }
  };

  const { clientId, clientSecret, ...requestBodyWithoutClientCredentials } = tokenRequestBody;

  switch (tokenEndpointAuthOptions.method) {
    case TokenEndpointAuthMethod.ClientSecretJwt: {
      const clientSecretJwt = await new SignJWT({
        iss: clientId,
        sub: clientId,
        aud: tokenEndpoint,
        jti: generateStandardId(),
        exp: Math.floor(Date.now() / 1000) + 600, // Expiration time is 10 minutes
        iat: Math.floor(Date.now() / 1000),
      })
        .setProtectedHeader({
          alg: tokenEndpointAuthOptions.clientSecretJwtSigningAlgorithm,
        })
        .sign(Buffer.from(clientSecret))
        .catch((error: unknown) => {
          if (error instanceof Error) {
            throw new ConnectorError(
              ConnectorErrorCodes.General,
              'Failed to sign client secret JWT'
            );
          }
          throw error;
        });

      return postTokenEndpoint({
        form: {
          ...requestBodyWithoutClientCredentials,
          clientId,
          clientAssertion: clientSecretJwt,
          /**
           * `client_assertion_type` parameter MUST be "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"
           *  see https://datatracker.ietf.org/doc/html/rfc7523#section-2.2
           */
          clientAssertionType: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        },
      });
    }
    case TokenEndpointAuthMethod.ClientSecretBasic: {
      return postTokenEndpoint({
        form: requestBodyWithoutClientCredentials,
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      });
    }
    case TokenEndpointAuthMethod.ClientSecretPost: {
      return postTokenEndpoint({
        form: tokenRequestBody,
      });
    }
  }
};

/**
 * Constructs a complete URL for initiating OAuth authorization by appending properly formatted
 * query parameters to the provided authorization endpoint URL.
 *
 * @param authorizationEndpoint The base URL to which the OAuth authorization request is sent.
 * @param queryParameters An object containing OAuth specific parameters such as responseType, clientId, scope, redirectUri, and state. Additional custom parameters can also be included as needed. Parameters are automatically converted to snake_case and undefined values are removed.
 * @returns A string representing the fully constructed URL to be used for OAuth authorization.
 */
export const constructAuthorizationUri = (
  authorizationEndpoint: string,
  queryParameters: {
    responseType: string;
    clientId: string;
    scope?: string;
    redirectUri: string;
    state: string;
  } & Record<string, string | undefined>
) =>
  `${authorizationEndpoint}?${new URLSearchParams(
    removeUndefinedKeys(snakecaseKeys(queryParameters))
  ).toString()}`;
