import {
  LogtoJwtTokenKey,
  type JwtCustomizerType,
  customJwtErrorBodyGuard,
  type CustomJwtErrorBody,
} from '@logto/schemas';
import { type ResponseError } from '@withtyped/client';
import { z } from 'zod';

import RequestError from '../../errors/RequestError/index.js';

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
