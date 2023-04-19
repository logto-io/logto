import type { ReactPlugin, withAITracking } from '@microsoft/applicationinsights-react-js';
import type { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { type Optional } from '@silverhand/essentials';
import { type ComponentType } from 'react';

class AppInsightsReact {
  protected reactPlugin?: ReactPlugin;
  protected withAITracking?: typeof withAITracking;
  protected appInsights?: ApplicationInsights;

  get instance(): Optional<ApplicationInsights> {
    return this.appInsights;
  }

  get trackPageView(): Optional<ApplicationInsights['trackPageView']> {
    return this.appInsights?.trackPageView.bind(this.appInsights);
  }

  async setup(cloudRole: string, connectionString_?: string): Promise<boolean> {
    // The string needs to be normalized since it may contain '"'
    const connectionString = (
      connectionString_ ?? process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
    )?.replace(/^"?(.*)"?$/g, '$1');

    if (!connectionString) {
      return false;
    }

    if (this.appInsights?.config.connectionString === connectionString) {
      return true;
    }

    try {
      const { ReactPlugin, withAITracking } = await import(
        '@microsoft/applicationinsights-react-js'
      );
      const { ApplicationInsights } = await import('@microsoft/applicationinsights-web');
      // https://github.com/microsoft/applicationinsights-react-js#readme
      this.withAITracking = withAITracking;
      this.reactPlugin = new ReactPlugin();
      this.appInsights = new ApplicationInsights({
        config: {
          connectionString,
          enableAutoRouteTracking: false,
          extensions: [this.reactPlugin],
        },
      });

      this.appInsights.addTelemetryInitializer((item) => {
        // The key 'ai.cloud.role' is extracted from Node SDK
        // @see https://learn.microsoft.com/en-us/azure/azure-monitor/app/nodejs#multiple-roles-for-multi-component-applications
        // @see https://github.com/microsoft/ApplicationInsights-node.js/blob/a573e40fc66981c6a3106bdc5b783d1d94f64231/Schema/PublicSchema/ContextTagKeys.bond#L83
        // eslint-disable-next-line @silverhand/fp/no-mutation
        item.tags = [...(item.tags ?? []), { 'ai.cloud.role': cloudRole }];
      });

      this.appInsights.loadAppInsights();
    } catch (error: unknown) {
      console.error('Unable to init ApplicationInsights:');
      console.error(error);

      return false;
    }

    return true;
  }

  withAppInsights<P>(Component: ComponentType<P>): ComponentType<P> {
    if (!this.reactPlugin || !this.withAITracking) {
      return Component;
    }

    return this.withAITracking(this.reactPlugin, Component, undefined, 'appInsightsWrapper');
  }
}

export const appInsightsReact = new AppInsightsReact();
