import { CaptchaType, RecaptchaEnterpriseMode, Theme } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import CaptchaContext from '@/Providers/CaptchaContextProvider/CaptchaContext';
import { mountFriendlyCaptchaWidget } from '@/Providers/CaptchaContextProvider/friendly-captcha';
import PageContext from '@/Providers/PageContextProvider/PageContext';

import styles from './index.module.scss';

const CaptchaBox = () => {
  const { captchaConfig, widgetRef, isCaptchaRequired } = useContext(CaptchaContext);
  const { theme } = useContext(PageContext);
  const { i18n } = useTranslation();

  // Check if widget rendering is needed
  // Turnstile, Cap, and Friendly Captcha always need a widget; reCAPTCHA Enterprise needs it only in checkbox mode
  const needsWidget =
    isCaptchaRequired &&
    captchaConfig &&
    (captchaConfig.type === CaptchaType.Turnstile ||
      captchaConfig.type === CaptchaType.Cap ||
      captchaConfig.type === CaptchaType.FriendlyCaptcha ||
      captchaConfig.mode === RecaptchaEnterpriseMode.Checkbox);

  useEffect(() => {
    const container = widgetRef?.current;

    if (!isCaptchaRequired || captchaConfig?.type !== CaptchaType.FriendlyCaptcha || !container) {
      return;
    }

    return mountFriendlyCaptchaWidget(container, {
      siteKey: captchaConfig.siteKey,
      theme: theme === Theme.Light ? 'light' : 'dark',
      language: i18n.language,
      apiEndpoint: captchaConfig.apiEndpoint,
    });
  }, [captchaConfig, i18n.language, isCaptchaRequired, theme, widgetRef]);

  if (!needsWidget) {
    return null;
  }

  if (captchaConfig.type === CaptchaType.Cap && captchaConfig.endpoint) {
    return (
      <div ref={widgetRef} className={styles.captchaBox}>
        <cap-widget
          // Re-create the widget when the language changes, since the widget resolves its labels once
          key={i18n.language}
          class={styles.capWidget}
          data-cap-api-endpoint={`${captchaConfig.endpoint.replace(/\/+$/, '')}/${encodeURIComponent(
            captchaConfig.siteKey
          )}/`}
          data-cap-lang={i18n.language}
        />
      </div>
    );
  }

  return <div ref={widgetRef} className={styles.captchaBox} />;
};

export default CaptchaBox;
