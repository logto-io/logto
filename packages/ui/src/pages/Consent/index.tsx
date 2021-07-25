import React, { useEffect } from 'react';
import { consent } from '@/apis/consent';
import { useTranslation } from 'react-i18next';

const Consent = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const autoConsent = async () => {
      window.location.href = (await consent()).redirectTo;
    };

    void autoConsent();
  }, []);

  return <div>{t('sign_in.loading')}</div>;
};

export default Consent;
