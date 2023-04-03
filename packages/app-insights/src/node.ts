import { trySafe } from '@silverhand/essentials';
import type { TelemetryClient } from 'applicationinsights';

export const normalizeError = (error: unknown) => {
  const normalized = error instanceof Error ? error : new Error(String(error));

  // Add message if empty otherwise Application Insights will respond 400
  // and the error will not be recorded.
  // eslint-disable-next-line @silverhand/fp/no-mutation
  normalized.message ||= 'Error occurred.';

  return normalized;
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
    applicationinsights.start();

    return true;
  }

  trackException(error: unknown) {
    this.client?.trackException({ exception: normalizeError(error) });
  }
}

export const appInsights = new AppInsights();
