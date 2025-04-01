import { useEffect, useRef } from 'react';

import styles from './index.module.scss';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (sitekey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

type Props = {
  readonly siteKey: string;
  readonly onVerify: (token: string) => void;
};

const scriptId = 'recaptcha-enterprise-script';

const ReCaptchaEnterprise = ({ siteKey, onVerify }: Props) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const isRendered = useRef(false);

  /* eslint-disable @silverhand/fp/no-mutation */
  useEffect(() => {
    const render = async () => {
      if (!window.grecaptcha?.enterprise || !captchaRef.current || isRendered.current) {
        return;
      }

      window.grecaptcha.enterprise.ready(async () => {
        const token = await window.grecaptcha?.enterprise.execute(siteKey, {
          action: 'interaction',
        });

        if (token) {
          onVerify(token);
        }
      });
      isRendered.current = true;
    };

    // Check if script already exists
    if (document.querySelector(`#${scriptId}`)) {
      void render();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
    script.id = scriptId;
    script.async = true;

    script.addEventListener('load', () => {
      void render();
    });

    document.body.append(script);
  }, [siteKey, onVerify]);
  /* eslint-enable @silverhand/fp/no-mutation */

  return <div ref={captchaRef} className={styles.wrapper} />;
};

export default ReCaptchaEnterprise;
