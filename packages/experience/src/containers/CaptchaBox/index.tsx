import { CaptchaType, RecaptchaEnterpriseMode } from '@logto/schemas';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import CaptchaContext from '@/Providers/CaptchaContextProvider/CaptchaContext';

import styles from './index.module.scss';

const CaptchaBox = () => {
  const { captchaConfig, widgetRef, isCaptchaRequired } = useContext(CaptchaContext);
  const { i18n } = useTranslation();

  // Check if widget rendering is needed
  // Turnstile and Cap always need a widget, reCAPTCHA Enterprise needs it only in checkbox mode
  const needsWidget =
    isCaptchaRequired &&
    captchaConfig &&
    (captchaConfig.type === CaptchaType.Turnstile ||
      captchaConfig.type === CaptchaType.Cap ||
      captchaConfig.mode === RecaptchaEnterpriseMode.Checkbox);

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
