import { type ReactNode, createContext, useMemo, useState } from 'react';

type Context = {
  initialized: boolean;
  setInitialized: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AppInsightsContext = createContext<Context>({
  initialized: false,
  setInitialized: () => {
    throw new Error('Not implemented');
  },
});

type Properties = {
  children: ReactNode;
};

export const AppInsightsProvider = ({ children }: Properties) => {
  const [initialized, setInitialized] = useState(false);
  const context = useMemo<Context>(
    () => ({
      initialized,
      setInitialized,
    }),
    [initialized]
  );

  return <AppInsightsContext.Provider value={context}>{children}</AppInsightsContext.Provider>;
};
