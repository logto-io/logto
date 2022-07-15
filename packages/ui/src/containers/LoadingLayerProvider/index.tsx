import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { useDebouncedLoader } from 'use-debounced-loader';

import LoadingLayer from '@/components/LoadingLayer';
import { PageContext } from '@/hooks/use-page-context';

const LoadingLayerProvider = () => {
  const { loading } = useContext(PageContext);
  const debouncedLoading = useDebouncedLoader(loading);

  return (
    <>
      <Outlet />
      {debouncedLoading && <LoadingLayer />}
    </>
  );
};

export default LoadingLayerProvider;
