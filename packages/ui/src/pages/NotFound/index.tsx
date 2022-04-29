import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import BrandingHeader from '@/components/BrandingHeader';
import NavBar from '@/components/NavBar';
import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';

const NotFound = () => {
  const { experienceSettings } = useContext(PageContext);
  const { logoUrl = '' } = experienceSettings?.branding ?? {};
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  return (
    <div className={styles.wrapper}>
      <NavBar />
      <BrandingHeader className={styles.header} logo={logoUrl} />
      <div className={styles.error}>404</div>
      <div>{t('description.not_found')}</div>
    </div>
  );
};

export default NotFound;
