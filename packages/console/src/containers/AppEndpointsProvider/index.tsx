import ky from 'ky';
import type { ReactNode } from 'react';
import { useMemo, useEffect, createContext, useState } from 'react';

type Props = {
  children: ReactNode;
};

export type AppEndpoints = {
  app?: URL;
  console?: URL;
};

export type AppEndpointKey = keyof AppEndpoints;

export const AppEndpointsContext = createContext<AppEndpoints>({});

const AppEndpointsProvider = ({ children }: Props) => {
  const [endpoints, setEndpoints] = useState<AppEndpoints>({});
  const memorizedContext = useMemo(() => endpoints, [endpoints]);

  useEffect(() => {
    const getEndpoint = async () => {
      const { app, console } = await ky
        .get(new URL('api/.well-known/endpoints', window.location.origin))
        .json<{ app: string; console: string }>();
      setEndpoints({ app: new URL(app), console: new URL(console) });
    };

    void getEndpoint();
  }, []);

  return (
    <AppEndpointsContext.Provider value={memorizedContext}>{children}</AppEndpointsContext.Provider>
  );
};

export default AppEndpointsProvider;
