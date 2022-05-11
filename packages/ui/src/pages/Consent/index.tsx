import { conditionalString } from '@silverhand/essentials';
import React, { useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { consent } from '@/apis/consent';
import useApi from '@/hooks/use-api';
import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';

const Consent = () => {
  const { experienceSettings } = useContext(PageContext);
  const logoUrl = conditionalString(experienceSettings?.branding.logoUrl);
  const { result, run: asyncConsent } = useApi(consent);

  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  useEffect(() => {
    void asyncConsent();
  }, [asyncConsent]);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.assign(result.redirectTo);
    }
  }, [result]);

  return (
    <div className={styles.wrapper}>
      <img src={logoUrl} />
      <div className={styles.content}>{t('description.loading')}</div>
    </div>
  );
};

export default Consent;
