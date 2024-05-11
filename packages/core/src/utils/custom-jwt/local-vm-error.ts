import { ResponseError } from '@withtyped/client';

// Extend the ResponseError from @withtyped/client, so that we can unify the error handling and display logic for both OSS version and Cloud version.
export class LocalVmError extends ResponseError {
  constructor(errorBody: Record<string, unknown>, statusCode: number) {
    super(
      new Response(
        new Blob([JSON.stringify(errorBody)], {
          type: 'application/json',
        }),
        {
          status: statusCode,
        }
      )
    );
  }
}
