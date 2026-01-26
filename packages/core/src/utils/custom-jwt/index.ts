import {
  LogtoJwtTokenKey,
  type JwtCustomizerType,
  customJwtErrorBodyGuard,
  type CustomJwtErrorBody,
} from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';
import { type HTTPError } from 'got';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';

import { type CustomJwtDeployRequestBody } from './types.js';

export * from './types.js';
export * from './local-vm.js';

export const getJwtCustomizerScripts = (jwtCustomizers: Partial<JwtCustomizerType>) => {
  // eslint-disable-next-line no-restricted-syntax -- enable to infer the type using `Object.fromEntries`
  return Object.fromEntries(
    Object.values(LogtoJwtTokenKey).map((key) => [key, { production: jwtCustomizers[key]?.script }])
  ) as CustomJwtDeployRequestBody;
};

/**
 * Parse the withtyped ResponseError body.
 * @see {@link https://github.com/withtyped/withtyped/blob/master/packages/server/src/index.ts} handleError method
 */
const errorResponseGuard = z.object({
  message: z.string(),
  error: z.unknown().optional(),
});

type ErrorResponse = z.infer<typeof errorResponseGuard>;

/**
 * Parse the CustomJwtErrorBody from the response.
 *
 * @param {ResponseError} error The response error, should always be the cloud service ResponseError type.
 * @returns {Promise<CustomJwtErrorBody>} The parsed CustomJwtErrorBody.
 * @throws {RequestError} error if the response is not a standard CustomJwtError.
 */
export const parseCustomJwtResponseError = async (
  error: ResponseError
): Promise<CustomJwtErrorBody> => {
  const errorResponse = errorResponseGuard.safeParse(await error.response.json());

  // Can not parse the ResponseError body.
  if (!errorResponse.success) {
    throw new RequestError(
      {
        code: 'jwt_customizer.general',
        status: 500,
      },
      { message: error.message }
    );
  }

  const errorResponseData = errorResponse.data;

  const errorBody = customJwtErrorBodyGuard.safeParse(errorResponseData.error);

  // Not a standard CustomJwtError body.
  if (!errorBody.success) {
    throw new RequestError(
      {
        code: 'jwt_customizer.general',
        status: 422,
      },
      { message: errorResponseData.message }
    );
  }

  return errorBody.data;
};

/**
 * This function is used to convert the GOT @see {HTTPError} from Azure Functions response
 * to WithTyped client @see {ResponseError} for unified error handling.
 *
 * - extract the response body from  @see {HTTPError}
 * - convert to @see {ErrorResponse} type
 * - create a new @see {ResponseError} with the extracted data
 */
export const parseAzureFunctionsResponseError = (error: HTTPError): ResponseError => {
  const { statusCode, statusMessage, headers, body } = error.response;

  const responseBody =
    conditional(
      typeof body === 'string' &&
        // eslint-disable-next-line no-restricted-syntax
        trySafe(() => JSON.parse(body) as unknown)
    ) ?? body;

  const parsedBody = errorResponseGuard.omit({ error: true }).safeParse(responseBody);
  const errorResponseData: ErrorResponse = {
    message: parsedBody.success ? parsedBody.data.message : error.message,
    error: responseBody,
  };

  // Generate a new Response object to create ResponseError
  const errorResponse = new Response(JSON.stringify(errorResponseData), {
    status: statusCode,
    statusText: statusMessage,
    // eslint-disable-next-line no-restricted-syntax
    headers: headers as HeadersInit,
  });

  return new ResponseError(errorResponse);
};
