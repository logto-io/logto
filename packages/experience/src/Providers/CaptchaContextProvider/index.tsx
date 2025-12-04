import { CaptchaType, RecaptchaEnterpriseMode, Theme } from '@logto/schemas';
import { useMemo, useContext, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import useToast from '@/hooks/use-toast';

import PageContext from '../PageContextProvider/PageContext';

import CaptchaContext, { type CaptchaContextType } from './CaptchaContext';
import { scriptId } from './constant';
import { getScript } from './utils';

type Props = {
  readonly children: React.ReactNode;
};

const CaptchaContextProvider = ({ children }: Props) => {
  const { experienceSettings, theme } = useContext(PageContext);
  const widgetRef = useRef<HTMLDivElement>(null);
  const { setToast } = useToast();
  const { t } = useTranslation();

  const captchaPolicy = experienceSettings?.captchaPolicy;
  const captchaConfig = experienceSettings?.captchaConfig;

  const isCaptchaRequired = Boolean(captchaPolicy?.enabled);

  const initCaptcha = useCallback(() => {
    if (!isCaptchaRequired || !captchaConfig) {
      return;
    }

    if (document.querySelector(`#${scriptId}`)) {
      return;
    }

    const script = document.createElement('script');
    /* eslint-disable @silverhand/fp/no-mutation */
    script.src = getScript(captchaConfig);
    script.id = scriptId;
    script.async = true;
    /* eslint-enable @silverhand/fp/no-mutation */

    document.body.append(script);
  }, [isCaptchaRequired, captchaConfig]);

  const executeCaptcha = useCallback(async () => {
    if (!isCaptchaRequired || !captchaConfig) {
      return;
    }

    if (captchaConfig.type === CaptchaType.Turnstile) {
      return new Promise<string | undefined>((resolve, reject) => {
        if (!window.turnstile || !widgetRef.current) {
          resolve(undefined);
          return;
        }

        // Clear the dom element first
        // eslint-disable-next-line @silverhand/fp/no-mutation
        widgetRef.current.innerHTML = '';

        window.turnstile.render(widgetRef.current, {
          sitekey: captchaConfig.siteKey,
          theme: theme === Theme.Light ? 'light' : 'dark',
          callback: (token: string) => {
            resolve(token);
          },
          'error-callback': (errorCode) => {
            setToast(t('error.captcha_verification_failed'));
            reject(new Error(`Turnstile error: ${errorCode}`));
          },
          size: 'flexible',
        });
      });
    }

    if (!window.grecaptcha?.enterprise) {
      return;
    }

    // Handle checkbox mode for reCAPTCHA Enterprise
    if (captchaConfig.mode === RecaptchaEnterpriseMode.Checkbox) {
      return new Promise<string | undefined>((resolve, reject) => {
        if (!window.grecaptcha || !widgetRef.current) {
          resolve(undefined);
          return;
        }

        // Clear the dom element first
        // eslint-disable-next-line @silverhand/fp/no-mutation
        widgetRef.current.innerHTML = '';

        window.grecaptcha.enterprise.render(widgetRef.current, {
          sitekey: captchaConfig.siteKey,
          theme: theme === Theme.Light ? 'light' : 'dark',
          callback: (token: string) => {
            resolve(token);
          },
          'error-callback': (errorCode) => {
            setToast(t('error.captcha_verification_failed'));
            reject(new Error(`reCAPTCHA error: ${errorCode}`));
          },
        });
      });
    }

    // Default invisible mode
    return window.grecaptcha.enterprise.execute(captchaConfig.siteKey, {
      action: 'interaction',
    });
  }, [isCaptchaRequired, captchaConfig, theme, setToast, t]);

  useEffect(() => {
    initCaptcha();
  }, [initCaptcha]);

  const captchaContext = useMemo<CaptchaContextType>(
    () => ({
      isCaptchaRequired,
      executeCaptcha,
      captchaConfig,
      widgetRef,
    }),
    [isCaptchaRequired, executeCaptcha, captchaConfig, widgetRef]
  );

  return <CaptchaContext.Provider value={captchaContext}>{children}</CaptchaContext.Provider>;
};

export default CaptchaContextProvider;
