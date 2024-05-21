import { type ExceptionTelemetry } from '@logto/app-insights/node';
import { type ExtendableContext } from 'koa';

// eslint-disable-next-line @typescript-eslint/ban-types
const getRequestIdFromContext = (context: object): string | undefined => {
  if ('requestId' in context && typeof context.requestId === 'string') {
    return context.requestId;
  }
};

export const buildAppInsightsTelemetry = (
  context: ExtendableContext
): Partial<ExceptionTelemetry> => {
  const requestId = getRequestIdFromContext(context);
  const {
    host,
    'x-forwarded-proto': xForwardedProto,
    'x-forwarded-host': xForwardedHost,
  } = context.headers;

  return {
    properties: {
      requestId,
      host,
      xForwardedProto,
      xForwardedHost,
    },
  };
};
