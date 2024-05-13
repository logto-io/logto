import { type ExceptionTelemetry } from '@logto/app-insights/node';
import { type Context } from 'koa';

// eslint-disable-next-line @typescript-eslint/ban-types
const getRequestIdFromContext = (context: object): string | undefined => {
  if ('requestId' in context && typeof context.requestId === 'string') {
    return context.requestId;
  }
};

const getHostFromContext = (context: Context): string | undefined => {
  if ('host' in context.headers && typeof context.headers.host === 'string') {
    return context.headers.host;
  }
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const buildAppInsightsTelemetry = (context: object): Partial<ExceptionTelemetry> => {
  const requestId = getRequestIdFromContext(context);
  // eslint-disable-next-line no-restricted-syntax
  const host = getHostFromContext(context as Context);

  if (!requestId && !host) {
    return {};
  }

  return {
    properties: {
      ...(requestId ? { requestId } : {}),
      ...(host ? { host } : {}),
    },
  };
};
