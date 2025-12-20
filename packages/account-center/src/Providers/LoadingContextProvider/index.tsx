import { useMemo, useState, type ReactNode } from 'react';

import LoadingContext from './LoadingContext';

type Props = {
  readonly children: ReactNode;
};

const LoadingContextProvider = ({ children }: Props) => {
  const [loading, setLoading] = useState(false);

  const value = useMemo(
    () => ({
      loading,
      setLoading,
    }),
    [loading]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

export default LoadingContextProvider;
