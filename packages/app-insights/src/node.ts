import { trySafe } from '@silverhand/essentials';
import type { TelemetryClient } from 'applicationinsights';

export const normalizeError = (error: unknown) => {
  const errorObject = error instanceof Error ? error : new Error(String(error));

  /**
   * - Ensure the message if not empty otherwise Application Insights will respond 400
   *   and the error will not be recorded.
   * - We stringify error object here since other error properties won't show on the
   *   ApplicationInsights details page.
   */
  const message = JSON.stringify(
    errorObject,
    // ApplicationInsights shows call stack, no need to stringify
    Object.getOwnPropertyNames(errorObject).filter((value) => value !== 'stack')
  );

  // Ensure we don't mutate the original error
  const normalized = new Error(message);

  // Manually clone key fields of the error for AppInsights display
  /* eslint-disable @silverhand/fp/no-mutation */
  normalized.name = errorObject.name;
  normalized.stack = errorObject.stack;
  normalized.cause = errorObject.cause;
  /* eslint-enable @silverhand/fp/no-mutation */

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
