import classNames from 'classnames';
import { useCallback, useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import usePlatform from '@/hooks/use-platform';
import LogtoSignature from '@/shared/components/LogtoSignature';
import { layoutClassNames } from '@/utils/consts';

import CustomContent from './CustomContent';
import styles from './index.module.scss';

const REFERRER_KEY = 'logto_referrer';

const allowedHosts = ['aaaauto.cz', 'aaaauto.sk', 'aaaauto.pl', 'localhost'];

const localeToDomain: Record<string, string> = {
  cs: 'https://www.aaaauto.cz',
  sk: 'https://www.aaaauto.sk',
  pl: 'https://www.aaaauto.pl',
};

const isAllowedUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);
    return allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
};

const AppLayout = () => {
  const { experienceSettings, theme } = useContext(PageContext);
  const { isMobile } = usePlatform();
  const hideLogtoBranding = experienceSettings?.hideLogtoBranding === true;

  useEffect(() => {
    if (document.referrer && isAllowedUrl(document.referrer)) {
      sessionStorage.setItem(REFERRER_KEY, document.referrer);
    }
  }, []);

  const handleBack = useCallback(() => {
    const backUrl = sessionStorage.getItem('back_url');
    if (backUrl && isAllowedUrl(backUrl)) {
      sessionStorage.removeItem('back_url');
      window.location.assign(backUrl);
      return;
    }
    const referrer = sessionStorage.getItem(REFERRER_KEY);
    if (referrer && isAllowedUrl(referrer)) {
      window.location.assign(referrer);
      return;
    }
    // Fallback based on ui_locales
    const locale = sessionStorage.getItem('ui_locales')?.split(' ')[0] ?? '';
    const domain = localeToDomain[locale] ?? 'https://www.aaaauto.cz';
    window.location.assign(domain);
  }, []);

  return (
    <div className={styles.viewBox}>
      <button type="button" className={styles.closeButton} onClick={handleBack}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.00065 1.3335C4.31865 1.3335 1.33398 4.31816 1.33398 8.00016C1.33398 11.6822 4.31865 14.6668 8.00065 14.6668C11.6827 14.6668 14.6673 11.6822 14.6673 8.00016C14.6673 4.31816 11.6827 1.3335 8.00065 1.3335ZM10.521 9.81316C10.7163 10.0085 10.7163 10.3248 10.521 10.5202C10.4233 10.6182 10.2953 10.6668 10.1673 10.6668C10.0393 10.6668 9.91132 10.6182 9.81365 10.5205L8.00065 8.70716L6.18765 10.5202C6.08998 10.6182 5.96198 10.6668 5.83398 10.6668C5.70598 10.6668 5.57798 10.6182 5.48032 10.5205C5.28498 10.3252 5.28498 10.0088 5.48032 9.8135L7.29365 8.00016L5.48065 6.18716C5.28532 5.99183 5.28532 5.6755 5.48065 5.48016C5.67598 5.28483 5.99232 5.28483 6.18765 5.48016L8.00065 7.29316L9.81365 5.48016C10.009 5.28483 10.3253 5.28483 10.5207 5.48016C10.716 5.6755 10.716 5.99183 10.5207 6.18716L8.70765 8.00016L10.521 9.81316Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <div className={classNames(styles.container, layoutClassNames.pageContainer)}>
        {!isMobile && <CustomContent className={layoutClassNames.customContent} />}
        <main className={classNames(styles.main, layoutClassNames.mainContent)}>
          <Outlet />
          {!hideLogtoBranding && (
            <LogtoSignature
              className={classNames(styles.signature, layoutClassNames.signature)}
              theme={theme}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
