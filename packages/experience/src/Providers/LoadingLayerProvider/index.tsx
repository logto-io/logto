import { useContext } from 'react';
import { Outlet } from 'react-router-dom';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import LoadingMask from '@/components/LoadingMask';

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
