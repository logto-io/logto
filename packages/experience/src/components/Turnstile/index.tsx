import { useEffect, useRef } from 'react';

import styles from './index.module.scss';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void }
      ) => void;
    };
  }
}

type Props = {
  readonly siteKey: string;
  readonly onVerify: (token: string) => void;
};

const scriptId = 'cf-turnstile-script';

const Turnstile = ({ siteKey, onVerify }: Props) => {
  const turnstileRef = useRef<HTMLDivElement>(null);
  const isRendered = useRef(false);

  /* eslint-disable @silverhand/fp/no-mutation */
  useEffect(() => {
    const render = () => {
      if (!window.turnstile || !turnstileRef.current || isRendered.current) {
        return;
      }

      window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token);
        },
      });
      isRendered.current = true;
    };

    // Check if script already exists
    if (document.querySelector(`#${scriptId}`)) {
      render();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.id = scriptId;
    script.async = true;

    script.addEventListener('load', () => {
      render();
    });

    document.body.append(script);
  }, [siteKey, onVerify]);
  /* eslint-enable @silverhand/fp/no-mutation */

  return <div ref={turnstileRef} className={styles.turnstile} />;
};

export default Turnstile;
