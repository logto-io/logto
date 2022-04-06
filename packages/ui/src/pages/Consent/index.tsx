import React, { useEffect } from 'react';

import { consent } from '@/apis/consent';
import useApi from '@/hooks/use-api';

const Consent = () => {
  const { result, run: asyncConsent } = useApi(consent);

  useEffect(() => {
    void asyncConsent();
  }, [asyncConsent]);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.assign(result.redirectTo);
    }
  }, [result]);

  return <div>loading...</div>;
};

export default Consent;
