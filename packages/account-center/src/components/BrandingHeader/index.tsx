import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { getBrandingLogoUrl } from '@ac/utils/logo';

import styles from './index.module.scss';

const BrandingHeader = () => {
  const { theme, experienceSettings } = useContext(PageContext);
  const { t } = useTranslation();

  if (!experienceSettings) {
    return null;
  }

  const {
    branding,
    color: { isDarkModeEnabled },
  } = experienceSettings;
  const logoUrl = getBrandingLogoUrl({ theme, branding, isDarkModeEnabled });

  if (!logoUrl) {
    return null;
  }

  return (
    <header className={styles.header}>
      <img className={styles.logo} src={logoUrl} alt="logo" />
      <div className={styles.splitter} />
      <span className={styles.title}>{t('account_center.header.title')}</span>
    </header>
  );
};

export default BrandingHeader;
