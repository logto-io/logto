import { type ReactNode, createContext, useMemo, useState, useCallback } from 'react';

import { type AppInsightsReact, appInsightsReact as appInsights } from './AppInsightsReact';

const notImplemented = () => {
  throw new Error('Not implemented');
};

type Context = {
  needsSetup: boolean;
  isSetupFinished: boolean;
  setup: (...args: Parameters<typeof appInsights.setup>) => Promise<void>;
  appInsights: AppInsightsReact;
};

export const AppInsightsContext = createContext<Context>({
  needsSetup: true,
  isSetupFinished: false,
  setup: notImplemented,
  appInsights,
});

type Properties = {
  children: ReactNode;
};

export type SetupStatus = 'none' | 'loading' | 'initialized' | 'failed';

export const AppInsightsProvider = ({ children }: Properties) => {
  const [setupStatus, setSetupStatus] = useState<SetupStatus>('none');
  const setup = useCallback(
    async (...args: Parameters<typeof appInsights.setup>) => {
      if (setupStatus !== 'none') {
        return;
      }

      setSetupStatus('loading');
      const result = await appInsights.setup(...args);

      if (result) {
        console.debug('Initialized ApplicationInsights');
        setSetupStatus('initialized');
      } else {
        setSetupStatus('failed');
      }
    },
    [setupStatus]
  );

  const context = useMemo<Context>(
    () => ({
      needsSetup: setupStatus === 'none',
      isSetupFinished: setupStatus === 'initialized' || setupStatus === 'failed',
      setup,
      appInsights,
    }),
    [setup, setupStatus]
  );

  return <AppInsightsContext.Provider value={context}>{children}</AppInsightsContext.Provider>;
};
