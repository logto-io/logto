import { useEffect, useState } from 'react';

import styles from './App.module.scss';
import logtoLogoDark from './assets/logto-logo-dark.svg';
import logtoLogoLight from './assets/logto-logo-light.svg';
import logtoLogoShadow from './assets/logto-logo-shadow.svg';

const logtoUrl = `https://logto.io/?${new URLSearchParams({
  utm_source: 'sign_in',
  utm_medium: 'powered_by',
}).toString()}`;

export const useIsDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  return isDarkMode;
};

const Footer = ({ isDarkMode }: { readonly isDarkMode: boolean }) => (
  <div className={styles.footerContainer}>
    <a
      className={styles.footer}
      href={logtoUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Powered By Logto"
    >
      <span>Powered by</span>
      <img className={styles.staticLogo} src={logtoLogoShadow} alt="Logto" />
      <img
        className={styles.highlightLogo}
        src={isDarkMode ? logtoLogoDark : logtoLogoLight}
        alt="Logto"
      />
    </a>
  </div>
);

export default Footer;
