import { useCallback, useContext } from 'react';

import { type AppInsightsReact, appInsightsReact } from './AppInsightsReact.js';
import { AppInsightsContext } from './context.js';

export type UseAppInsights = {
  initialized: boolean;
  setup: typeof appInsightsReact.setup;
  appInsights: AppInsightsReact;
};

export const useAppInsights = () => {
  const { initialized, setInitialized } = useContext(AppInsightsContext);

  const setup = useCallback(
    async (...args: Parameters<typeof appInsightsReact.setup>) => {
      const result = await appInsightsReact.setup(...args);

      if (result) {
        console.debug('Initialized ApplicationInsights');
        setInitialized(true);
      }
    },
    [setInitialized]
  );

  return { initialized, setup, appInsights: appInsightsReact };
};
