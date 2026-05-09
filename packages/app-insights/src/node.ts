import { trySafe } from '@silverhand/essentials';
import type { TelemetryClient } from 'applicationinsights';
import {
  type EnvelopeTelemetry,
  type ExceptionTelemetry,
} from 'applicationinsights/out/Declarations/Contracts/index.js';

import { normalizeError } from './normalize-error.js';

export { type ExceptionTelemetry } from 'applicationinsights/out/Declarations/Contracts/index.js';

type RequestTelemetryEnvelope = EnvelopeTelemetry & {
  data: { baseData?: { properties?: Record<string, string | undefined> } };
};

type ServerRequestContext = {
  headers?: {
    'x-forwarded-for'?: string | string[];
    'x-forwarded-host'?: string | string[];
    'x-forwarded-proto'?: string | string[];
  };
};

type RequestContext = Record<string, ServerRequestContext>;

const getFirstForwardedHeaderValue = (value?: string | string[]) =>
  (Array.isArray(value) ? value[0] : value)?.split(',')[0]?.trim();

const appendForwardedHeadersToRequestTelemetry = (
  envelope: RequestTelemetryEnvelope,
  { 'http.ServerRequest': request }: RequestContext = {}
) => {
  const xForwardedFor = getFirstForwardedHeaderValue(request?.headers?.['x-forwarded-for']);
  const xForwardedHost = getFirstForwardedHeaderValue(request?.headers?.['x-forwarded-host']);
  const xForwardedProto = getFirstForwardedHeaderValue(request?.headers?.['x-forwarded-proto']);
  const forwardedProperties = {
    ...(xForwardedFor && { xForwardedFor }),
    ...(xForwardedHost && { xForwardedHost }),
    ...(xForwardedProto && { xForwardedProto }),
  };

  if (
    envelope.data.baseType !== 'RequestData' ||
    !envelope.data.baseData ||
    Object.keys(forwardedProperties).length === 0
  ) {
    return true;
  }

  // eslint-disable-next-line @silverhand/fp/no-mutation
  envelope.data.baseData.properties = {
    ...envelope.data.baseData.properties,
    ...forwardedProperties,
  };

  return true;
};

class AppInsights {
  client?: TelemetryClient;

  async setup(cloudRole: string): Promise<boolean> {
    if (this.client) {
      return true;
    }

    if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
      return false;
    }

    const { default: applicationinsights } = await import('applicationinsights');
    const ok = trySafe(() => applicationinsights.setup());

    if (!ok) {
      return false;
    }

    this.client = applicationinsights.defaultClient;
    this.client.context.tags[this.client.context.keys.cloudRole] = cloudRole;
    this.client.addTelemetryProcessor(appendForwardedHeadersToRequestTelemetry);
    applicationinsights.start();

    return true;
  }

  /**
   * The function is async to avoid blocking the main script and force the use of `await` or `void`.
   *
   * @param error The error to track. It will be normalized for better telemetry.
   * @param telemetry Additional telemetry to include in the exception.
   */
  async trackException(error: unknown, telemetry?: Partial<ExceptionTelemetry>) {
    this.client?.trackException({ exception: normalizeError(error), ...telemetry });
  }
}

export const appInsights = new AppInsights();
