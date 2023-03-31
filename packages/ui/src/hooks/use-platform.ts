import { useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';

const usePlatform = () => {
  const { platform } = useContext(PageContext);

  return { isMobile: platform === 'mobile', platform };
};

export default usePlatform;
