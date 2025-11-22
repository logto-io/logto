import { useContext } from 'react';
import { Outlet } from 'react-router-dom';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import { LoadingMask } from '@/shared/components/LoadingLayer';

const LoadingLayerProvider = () => {
  const { loading } = useContext(PageContext);

  return (
    <>
      <Outlet />
      {loading && <LoadingMask />}
    </>
  );
};

export default LoadingLayerProvider;
