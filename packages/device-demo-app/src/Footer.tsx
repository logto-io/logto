import { useEffect, useState } from 'react';

import styles from './App.module.scss';
import meshxMark from './assets/meshx-mark.svg';

const meshxUrl = `https://meshx.io/?${new URLSearchParams({
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
      href={meshxUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Powered By MeshX"
    >
      <span>Powered by</span>
      <img className={styles.staticLogo} src={meshxMark} alt="MeshX" />
      <img className={styles.highlightLogo} src={meshxMark} alt="MeshX" />
    </a>
  </div>
);

export default Footer;
