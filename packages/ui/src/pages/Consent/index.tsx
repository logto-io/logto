import { useEffect, useContext } from 'react';

import { consent } from '@/apis/consent';
import { LoadingIcon } from '@/components/LoadingLayer';
import useApi from '@/hooks/use-api';
import { PageContext } from '@/hooks/use-page-context';
import { getLogoUrl } from '@/utils/logo';

import * as styles from './index.module.scss';

const Consent = () => {
  const { experienceSettings, theme } = useContext(PageContext);
  const { error, result, run: asyncConsent } = useApi(consent);
  const branding = experienceSettings?.branding;

  useEffect(() => {
    void asyncConsent();
  }, [asyncConsent]);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [result]);

  return (
    <div className={styles.wrapper}>
      {branding && (
        <img
          alt="logo"
          src={getLogoUrl({ theme, logoUrl: branding.logoUrl, darkLogoUrl: branding.darkLogoUrl })}
        />
      )}
      {!error && <LoadingIcon />}
    </div>
  );
};

export default Consent;
