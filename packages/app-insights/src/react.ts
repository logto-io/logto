import { ReactPlugin, withAITracking } from '@microsoft/applicationinsights-react-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { type Optional } from '@silverhand/essentials';
import { type ComponentType } from 'react';

class AppInsightsReact {
  protected reactPlugin?: ReactPlugin;
  protected appInsights?: ApplicationInsights;

  get instance(): Optional<ApplicationInsights> {
    return this.appInsights;
  }

  get trackPageView(): Optional<ApplicationInsights['trackPageView']> {
    return this.appInsights?.trackPageView.bind(this.appInsights);
  }

  setup(): boolean {
    // The string needs to be normalized since it may contain '"'
    const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING?.replace(
      /^"?(.*)"?$/g,
      '$1'
    );

    if (!connectionString) {
      return false;
    }

    if (this.appInsights?.config.connectionString === connectionString) {
      return true;
    }

    try {
      // https://github.com/microsoft/applicationinsights-react-js#readme
      this.reactPlugin = new ReactPlugin();
      this.appInsights = new ApplicationInsights({
        config: {
          connectionString,
          enableAutoRouteTracking: false,
          extensions: [this.reactPlugin],
        },
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
    if (!this.reactPlugin) {
      return Component;
    }

    return withAITracking(this.reactPlugin, Component, undefined, 'appInsightsWrapper');
  }
}

export const appInsightsReact = new AppInsightsReact();
