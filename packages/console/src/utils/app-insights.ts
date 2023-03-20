import { ReactPlugin, withAITracking } from '@microsoft/applicationinsights-react-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import type { Optional } from '@silverhand/essentials';
import type { ComponentType } from 'react';

import { isCloud } from '@/consts/cloud';

/* eslint-disable @silverhand/fp/no-mutation, @silverhand/fp/no-let */
let reactPlugin: Optional<ReactPlugin>;
let appInsights: Optional<ApplicationInsights>;

const initAppInsights = () => {
  if (!isCloud) {
    return;
  }
  // https://github.com/microsoft/applicationinsights-react-js#readme
  reactPlugin = new ReactPlugin();
  appInsights = new ApplicationInsights({
    config: {
      connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
      enableAutoRouteTracking: true,
      extensions: [reactPlugin],
    },
  });

  appInsights.loadAppInsights();
};
/* eslint-enable @silverhand/fp/no-mutation, @silverhand/fp/no-let */

initAppInsights();

export const withAppInsights = (Component: ComponentType) => {
  if (!isCloud || !reactPlugin) {
    return Component;
  }

  return withAITracking(reactPlugin, Component);
};
