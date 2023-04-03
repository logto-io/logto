import { useRef, useEffect, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';

const useCustomStyle = () => {
  const customCssRef = useRef(document.createElement('style'));
  const { experienceSettings } = useContext(PageContext);

  useEffect(() => {
    document.head.append(customCssRef.current);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    customCssRef.current.textContent = experienceSettings?.customCss ?? null;
  }, [experienceSettings?.customCss]);
};

export default useCustomStyle;
