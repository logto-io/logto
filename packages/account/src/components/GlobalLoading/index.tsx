import { getBrandingLogoUrl } from '@experience/utils/logo';
import { useContext } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import LoadingIcon from '@ac/assets/icons/loading-icon.svg?react';

import styles from './index.module.scss';

const GlobalLoading = () => {
  const { theme, experienceSettings } = useContext(PageContext);

  const logoUrl =
    experienceSettings &&
    getBrandingLogoUrl({
      theme,
      branding: experienceSettings.branding,
      isDarkModeEnabled: experienceSettings.color.isDarkModeEnabled,
    });

  return (
    <div className={styles.container}>
      {logoUrl && <img className={styles.logo} src={logoUrl} alt="logo" />}
      <LoadingIcon className={styles.spinner} />
    </div>
  );
};

export default GlobalLoading;
