import { useMemo, useState, type ReactNode } from 'react';

import Loading from '@ac/components/Loading';

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

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {loading && <Loading />}
    </LoadingContext.Provider>
  );
};

export default LoadingContextProvider;
