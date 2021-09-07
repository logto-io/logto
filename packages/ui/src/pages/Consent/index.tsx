import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { consent } from '@/apis/consent';

const Consent = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const autoConsent = async () => {
      window.location.assign((await consent()).redirectTo);
    };

    void autoConsent();
  }, []);

  return <div>{t('sign_in.loading')}</div>;
};

export default Consent;
