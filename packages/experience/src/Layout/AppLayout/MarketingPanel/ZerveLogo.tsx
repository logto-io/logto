import { useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import { getBrandingLogoUrl } from '@/shared/utils/logo';

import styles from './index.module.scss';

const ZerveLogo = () => {
  const { experienceSettings, theme } = useContext(PageContext);

  if (!experienceSettings) {
    return null;
  }

  const logoUrl = getBrandingLogoUrl({
    theme,
    branding: experienceSettings.branding,
    isDarkModeEnabled: experienceSettings.color.isDarkModeEnabled,
  });

  if (!logoUrl) {
    return null;
  }

  return <img className={styles.logo} alt="app logo" src={logoUrl} />;
};

export default ZerveLogo;
