import { HTTPError } from 'ky';

const hasMessage = (value: unknown): value is { message: string } =>
  typeof value === 'object' &&
  value !== null &&
  'message' in value &&
  typeof value.message === 'string' &&
  value.message !== '';

// Shows the portal's own message (for example an invalid tenant) instead of a generic status.
export const readError = async (error: unknown) => {
  if (error instanceof HTTPError) {
    try {
      const body: unknown = await error.response.clone().json();
      if (hasMessage(body)) {
        return body.message;
      }
    } catch {
      // Not JSON: fall through to the generic message.
    }
  }
  return error instanceof Error ? error.message : 'Create failed';
};
