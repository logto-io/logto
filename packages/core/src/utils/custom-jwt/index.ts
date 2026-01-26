import {
  type CustomJwtErrorBody,
  customJwtErrorBodyGuard,
  CustomJwtErrorCode,
  LogtoJwtTokenKey,
  type JwtCustomizerType,
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
const errorResponseBodyGuard = z.object({
  message: z.string(),
  error: z.unknown().optional(),
});

type ErrorResponseBody = z.infer<typeof errorResponseBodyGuard>;

/**
 * Extract and parse the @see {ResponseError} body
 *
 * @param {ResponseError} error - The ResponseError instance
 * @throws {RequestError} when can not parse the ResponseError body
 * @returns {Promise<ErrorResponseBody>} Parsed error response body
 */
export const parseCustomJwtResponseError = async (
  error: ResponseError
): Promise<ErrorResponseBody> => {
  const errorResponseResult = errorResponseBodyGuard.safeParse(await error.response.json());

  // Should not happen: Can not parse the ResponseError body.
  if (!errorResponseResult.success) {
    throw new RequestError(
      {
        code: 'jwt_customizer.general',
        status: 500,
      },
      { message: error.message }
    );
  }

  return errorResponseResult.data;
};

/**
 * Safely check if the error is an access denied error.
 */
export const isAccessDeniedError = (
  error: unknown
): error is CustomJwtErrorBody & { code: CustomJwtErrorCode.AccessDenied } => {
  const errorData = customJwtErrorBodyGuard.safeParse(error);
  return errorData.success && errorData.data.code === CustomJwtErrorCode.AccessDenied;
};

/**
 * This function is used to convert the GOT @see {HTTPError} from Azure Functions response
 * to WithTyped client @see {ResponseError} for unified error handling.
 *
 * - extract the response body from  @see {HTTPError}
 * - convert to @see {ErrorResponseBody}
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

  const parsedBody = errorResponseBodyGuard.omit({ error: true }).safeParse(responseBody);

  const errorResponseData: ErrorResponseBody = {
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
