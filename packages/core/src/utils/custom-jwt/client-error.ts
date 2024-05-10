import { ResponseError } from '@withtyped/client';

export const buildWithtypedClientResponseError = (
  errorBody: Record<string, unknown>,
  statusCode: number
) => {
  return new ResponseError(
    new Response(
      new Blob([JSON.stringify(errorBody)], {
        type: 'application/json',
      }),
      {
        status: statusCode,
      }
    )
  );
};
