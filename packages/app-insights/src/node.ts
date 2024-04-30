import { trySafe } from '@silverhand/essentials';
import type { TelemetryClient } from 'applicationinsights';
import { type ExceptionTelemetry } from 'applicationinsights/out/Declarations/Contracts/index.js';

import { normalizeError } from './normalize-error.js';

export { type ExceptionTelemetry } from 'applicationinsights/out/Declarations/Contracts/index.js';

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
