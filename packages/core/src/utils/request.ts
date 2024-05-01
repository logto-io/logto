import { type ExceptionTelemetry } from '@logto/app-insights/node';

// eslint-disable-next-line @typescript-eslint/ban-types
const getRequestIdFromContext = (context: object): string | undefined => {
  if ('requestId' in context && typeof context.requestId === 'string') {
    return context.requestId;
  }

  return undefined;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const buildAppInsightsTelemetry = (context: object): Partial<ExceptionTelemetry> => {
  const requestId = getRequestIdFromContext(context);

  if (requestId) {
    return { properties: { requestId } };
  }

  return {};
};
