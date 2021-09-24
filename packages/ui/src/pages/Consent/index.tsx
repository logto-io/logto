import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { consent } from '@/apis/consent';
import useApi from '@/hooks/use-api';

const Consent = () => {
  const { t } = useTranslation();
  const { result, run: asyncConsent } = useApi(consent);

  useEffect(() => {
    void asyncConsent();
  }, []);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.assign(result.redirectTo);
    }
  }, [result]);

  return <div>{t('sign_in.loading')}</div>;
};

export default Consent;
