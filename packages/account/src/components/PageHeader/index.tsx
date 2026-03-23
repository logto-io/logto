import { getBrandingLogoUrl } from '@experience/shared/utils/logo';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';

import styles from './index.module.scss';

const PageHeader = () => {
  const { t } = useTranslation();
  const { theme, experienceSettings } = useContext(PageContext);

  const logoUrl =
    experienceSettings &&
    getBrandingLogoUrl({
      theme,
      branding: experienceSettings.branding,
      isDarkModeEnabled: experienceSettings.color.isDarkModeEnabled,
    });

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {logoUrl && <img className={styles.logo} src={logoUrl} alt="logo" />}
        <div className={styles.divider} />
        <span className={styles.appName}>{t('account_center.page.title')}</span>
      </div>
    </header>
  );
};

export default PageHeader;
