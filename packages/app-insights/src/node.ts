import { trySafe } from '@silverhand/essentials';
import type { TelemetryClient } from 'applicationinsights';

export const normalizeError = (error: unknown) => {
  const normalized = error instanceof Error ? error : new Error(String(error));

  /**
   * - Ensure the message if not empty otherwise Application Insights will respond 400
   *   and the error will not be recorded.
   * - We stringify error object here since other error properties won't show on the
   *   ApplicationInsights details page.
   */
  // eslint-disable-next-line @silverhand/fp/no-mutation
  normalized.message = JSON.stringify(
    error,
    // ApplicationInsights shows call stack, no need to stringify
    Object.getOwnPropertyNames(error).filter((value) => value !== 'stack')
  );

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
