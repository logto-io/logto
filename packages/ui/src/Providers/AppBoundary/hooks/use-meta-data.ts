import { conditionalString } from '@silverhand/essentials';
import { useEffect, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import { setFavIcon } from '@/utils/sign-in-experience';

import * as styles from '../index.module.scss';

// TODO: replace with react-helmet
const useMetaData = () => {
  const { experienceSettings, theme, platform } = useContext(PageContext);

  // Set favicon
  useEffect(() => {
    setFavIcon(experienceSettings?.branding.favicon);
  }, [experienceSettings?.branding.favicon]);

  // Set Theme Mode
  useEffect(() => {
    document.body.classList.remove(conditionalString(styles.light), conditionalString(styles.dark));
    document.body.classList.add(conditionalString(styles[theme]));
  }, [theme]);

  // Apply Platform Style
  useEffect(() => {
    document.body.classList.remove('desktop', 'mobile');
    document.body.classList.add(platform === 'mobile' ? 'mobile' : 'desktop');
  }, [platform]);
};

export default useMetaData;
