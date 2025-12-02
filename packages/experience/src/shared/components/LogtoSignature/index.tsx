import { Theme } from '@logto/schemas';
import { useEffect, useRef } from 'react';

import LogtoLogtoDark from '@/shared/assets/icons/logto-logo-dark.svg?react';
import LogtoLogoLight from '@/shared/assets/icons/logto-logo-light.svg?react';
import LogtoLogoShadow from '@/shared/assets/icons/logto-logo-shadow.svg?react';

import styles from './index.module.scss';

const logtoUrl = `https://logto.io/?${new URLSearchParams({
  utm_source: 'sign_in',
  utm_medium: 'powered_by',
}).toString()}`;

const guardStyleSelector = 'style[data-logto-signature-guard="true"]';

const signatureGuardStyle = `
[data-logto-signature-container="secured"][data-logto-signature-container="secured"] {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

[data-logto-signature="secured"][data-logto-signature="secured"] {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  font: var(--font-label-2) !important;
  font-weight: normal !important;
  color: var(--color-neutral-variant-60) !important;
  padding: 4px 8px !important;
  text-decoration: none !important;
  opacity: 75% !important;
  direction: ltr !important;
  position: relative !important;
  inset: auto !important;
  left: auto !important;
  right: auto !important;
  top: auto !important;
  bottom: auto !important;
  transform: none !important;
  pointer-events: auto !important;
}

[data-logto-signature="secured"][data-logto-signature="secured"]:is(:hover, :active, :focus-visible) {
  opacity: 100% !important;
}

[data-logto-signature="secured"][data-logto-signature="secured"] [data-logto-signature-icon="static"] {
  display: block !important;
}

[data-logto-signature="secured"][data-logto-signature="secured"] [data-logto-signature-icon="highlight"] {
  display: none !important;
}

[data-logto-signature="secured"][data-logto-signature="secured"]:is(:hover, :active, :focus-visible)
  [data-logto-signature-icon="static"] {
  display: none !important;
}

[data-logto-signature="secured"][data-logto-signature="secured"]:is(:hover, :active, :focus-visible)
  [data-logto-signature-icon="highlight"] {
  display: block !important;
}

[data-logto-signature-text] {
  margin-inline-end: 4px !important;
}

body.mobile [data-logto-signature="secured"][data-logto-signature="secured"] {
  color: var(--color-neutral-variant-80) !important;
  font: var(--font-label-3) !important;
}
`;

type Props = {
  readonly className?: string;
  readonly theme: Theme;
};

const LogtoSignature = ({ className, theme }: Props) => {
  const LogtoLogo = theme === Theme.Light ? LogtoLogoLight : LogtoLogtoDark;

  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const { current: container } = containerRef;
    const { current: anchor } = anchorRef;

    if (!anchor) {
      return;
    }

    const ensureGuardStyle = (): { created: boolean; element: HTMLStyleElement } => {
      const existing = document.head.querySelector<HTMLStyleElement>(guardStyleSelector);

      if (existing) {
        return { created: false, element: existing };
      }

      const createdElement = document.createElement('style');
      Reflect.set(createdElement.dataset, 'logtoSignatureGuard', 'true');
      createdElement.append(signatureGuardStyle);
      document.head.append(createdElement);

      return { created: true, element: createdElement };
    };

    const { created, element: guardStyleElement } = ensureGuardStyle();

    const enforceIntegrity = () => {
      if (container) {
        container.removeAttribute('hidden');
        container.style.setProperty('display', 'block', 'important');
        container.style.setProperty('visibility', 'visible', 'important');
        container.style.setProperty('opacity', '1', 'important');
      }

      anchor.removeAttribute('hidden');

      if (styles.signature && !anchor.classList.contains(styles.signature)) {
        anchor.classList.add(styles.signature);
      }

      anchor.style.removeProperty('display');
      anchor.style.removeProperty('visibility');
      anchor.style.removeProperty('opacity');
      anchor.style.removeProperty('position');
      anchor.style.removeProperty('left');
      anchor.style.removeProperty('right');
      anchor.style.removeProperty('top');
      anchor.style.removeProperty('bottom');
      anchor.style.removeProperty('transform');
    };

    enforceIntegrity();

    const observer = new MutationObserver(() => {
      enforceIntegrity();
    });

    observer.observe(anchor, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });

    if (container) {
      observer.observe(container, {
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden'],
      });
    }

    const intervalId = window.setInterval(enforceIntegrity, 2000);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);

      if (created) {
        guardStyleElement.remove();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={className} data-logto-signature-container="secured">
      <a
        ref={anchorRef}
        aria-label="Powered By Logto"
        className={styles.signature}
        data-logto-signature="secured"
        href={logtoUrl.toString()}
        rel="noopener"
        target="_blank"
      >
        <span data-logto-signature-text className={styles.text}>
          Powered by
        </span>
        <LogtoLogoShadow data-logto-signature-icon="static" className={styles.staticIcon} />
        <LogtoLogo data-logto-signature-icon="highlight" className={styles.highlightIcon} />
      </a>
    </div>
  );
};

export default LogtoSignature;
