import { ReactPlugin, withAITracking } from '@microsoft/applicationinsights-react-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import type { Optional } from '@silverhand/essentials';
import type { ComponentType } from 'react';

import { isCloud } from '@/consts/cloud';

/* eslint-disable @silverhand/fp/no-mutation, @silverhand/fp/no-let */
let reactPlugin: Optional<ReactPlugin>;
let appInsights: Optional<ApplicationInsights>;

const initAppInsights = () => {
  // The string needs to be normalized since it may contain '"'
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING?.replace(
    /^"?(.*)"?$/g,
    '$1'
  );

  if (!isCloud || !connectionString) {
    return;
  }

  try {
    // https://github.com/microsoft/applicationinsights-react-js#readme
    reactPlugin = new ReactPlugin();
    appInsights = new ApplicationInsights({
      config: {
        connectionString,
        enableAutoRouteTracking: true,
        extensions: [reactPlugin],
      },
    });

    appInsights.loadAppInsights();
  } catch (error: unknown) {
    console.error('Unable to init ApplicationInsights:');
    console.error(error);
  }
};
/* eslint-enable @silverhand/fp/no-mutation, @silverhand/fp/no-let */

initAppInsights();

export const withAppInsights = (Component: ComponentType) => {
  if (!isCloud || !reactPlugin) {
    return Component;
  }

  return withAITracking(reactPlugin, Component);
};
