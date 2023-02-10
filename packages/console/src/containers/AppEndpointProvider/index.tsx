import ky from 'ky';
import type { ReactNode } from 'react';
import { useMemo, useEffect, createContext, useState } from 'react';

type Props = {
  children: ReactNode;
};

export const AppEndpointContext = createContext<{ endpoint?: URL }>({});

const AppEndpointProvider = ({ children }: Props) => {
  const [endpoint, setEndpoint] = useState<URL>();
  const memorizedContext = useMemo(() => ({ endpoint }), [endpoint]);

  useEffect(() => {
    const getEndpoint = async () => {
      const { app } = await ky
        .get(new URL('api/.well-known/endpoints', window.location.origin))
        .json<{ app: string }>();
      setEndpoint(new URL(app));
    };

    void getEndpoint();
  }, []);

  return (
    <AppEndpointContext.Provider value={memorizedContext}>{children}</AppEndpointContext.Provider>
  );
};

export default AppEndpointProvider;
