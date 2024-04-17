import { type ClickAnalyticsPlugin } from '@microsoft/applicationinsights-clickanalytics-js';
import type { ReactPlugin, withAITracking } from '@microsoft/applicationinsights-react-js';
import type { ApplicationInsights, ITelemetryPlugin } from '@microsoft/applicationinsights-web';
import { conditional, conditionalArray, type Optional } from '@silverhand/essentials';
import { type ComponentType } from 'react';

export type SetupConfig = {
  connectionString?: string;
  /**
   * The config object for the ClickAnalytics plugin. If this is provided, the plugin will be
   * automatically loaded when calling `.setup()`.
   *
   * Wait for {@link https://github.com/microsoft/ApplicationInsights-JS/issues/2106 | microsoft/ApplicationInsights-JS#2106}
   * to be resolved to use a stronger type.
   *
   * @see {@link https://github.com/microsoft/ApplicationInsights-JS/tree/master/extensions/applicationinsights-clickanalytics-js#configuration | ClickAnalytics configuration}
   */
  clickPlugin?: Record<string, unknown>;
  cookieDomain?: string;
};

export class AppInsightsReact {
  /**
   * URL search parameters that start with `utm_`. It is an empty object until you call `.setup()`,
   * which will read the URL search string and store parameters in this property.
   */
  utmParameters: Record<string, string> = {};

  protected reactPlugin?: ReactPlugin;
  protected clickAnalyticsPlugin?: ClickAnalyticsPlugin;
  protected withAITracking?: typeof withAITracking;
  protected appInsights?: ApplicationInsights;

  get instance(): Optional<ApplicationInsights> {
    return this.appInsights;
  }

  get trackPageView(): Optional<ApplicationInsights['trackPageView']> {
    return this.appInsights?.trackPageView.bind(this.appInsights);
  }

  async setup(cloudRole: string, config?: string | SetupConfig): Promise<boolean> {
    const connectionStringFromConfig =
      typeof config === 'string' ? config : config?.connectionString;
    // The string needs to be normalized since it may contain '"'
    const connectionString = (
      connectionStringFromConfig ?? process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
    )?.replace(/^"?(.*)"?$/g, '$1');

    if (!connectionString) {
      return false;
    }

    if (this.appInsights?.config.connectionString === connectionString) {
      return true;
    }

    try {
      // Lazy load ApplicationInsights modules
      const { ReactPlugin, withAITracking } = await import(
        '@microsoft/applicationinsights-react-js'
      );
      const { ApplicationInsights } = await import('@microsoft/applicationinsights-web');

      // Conditionally load ClickAnalytics plugin
      const configObject = conditional(typeof config === 'object' && config) ?? {};
      const { cookieDomain, clickPlugin } = configObject;
      const initClickAnalyticsPlugin = async () => {
        const { ClickAnalyticsPlugin } = await import(
          '@microsoft/applicationinsights-clickanalytics-js'
        );
        return new ClickAnalyticsPlugin();
      };

      // Assign React props
      // https://github.com/microsoft/applicationinsights-react-js#readme
      this.withAITracking = withAITracking;
      this.reactPlugin = new ReactPlugin();

      // Assign ClickAnalytics prop
      this.clickAnalyticsPlugin = conditional(clickPlugin && (await initClickAnalyticsPlugin()));

      // Init ApplicationInsights instance
      this.appInsights = new ApplicationInsights({
        config: {
          cookieDomain,
          connectionString,
          enableAutoRouteTracking: false,
          extensions: conditionalArray<ITelemetryPlugin>(
            this.reactPlugin,
            this.clickAnalyticsPlugin
          ),
          extensionConfig: conditional(
            this.clickAnalyticsPlugin && {
              [this.clickAnalyticsPlugin.identifier]: clickPlugin,
            }
          ),
        },
      });

      // Extract UTM parameters
      const searchParams = [...new URLSearchParams(window.location.search).entries()];
      this.utmParameters = Object.fromEntries(
        searchParams.filter(([key]) => key.startsWith('utm_'))
      );

      this.appInsights.addTelemetryInitializer((item) => {
        // @see https://github.com/microsoft/ApplicationInsights-JS#example-setting-cloud-role-name
        // @see https://github.com/microsoft/ApplicationInsights-node.js/blob/a573e40fc66981c6a3106bdc5b783d1d94f64231/Schema/PublicSchema/ContextTagKeys.bond#L83
        /* eslint-disable @silverhand/fp/no-mutation */
        item.tags = { ...item.tags, 'ai.cloud.role': cloudRole };
        /* eslint-enable @silverhand/fp/no-mutation */
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

export const withAppInsights = appInsightsReact.withAppInsights.bind(appInsightsReact);
