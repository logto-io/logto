import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { useDebouncedLoader } from 'use-debounced-loader';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import LoadingLayer from '@/components/LoadingLayer';

const LoadingLayerProvider = () => {
  const { loading } = useContext(PageContext);
  const debouncedLoading = useDebouncedLoader(loading, 500);

  return (
    <>
      <Outlet />
      {debouncedLoading && <LoadingLayer />}
    </>
  );
};

export default LoadingLayerProvider;
