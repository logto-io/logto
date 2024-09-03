import { Theme } from '@logto/schemas';
import { useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import LogtoLogtoDark from '@/assets/icons/logto-logo-dark.svg?react';
import LogtoLogoLight from '@/assets/icons/logto-logo-light.svg?react';
import LogtoLogoShadow from '@/assets/icons/logto-logo-shadow.svg?react';

import styles from './index.module.scss';

const logtoUrl = `https://logto.io/?${new URLSearchParams({
  utm_source: 'sign_in',
  utm_medium: 'powered_by',
}).toString()}`;

type Props = {
  readonly className?: string;
};

const LogtoSignature = ({ className }: Props) => {
  const { theme } = useContext(PageContext);
  const LogtoLogo = theme === Theme.Light ? LogtoLogoLight : LogtoLogtoDark;

  return (
    <div className={className}>
      <a
        className={styles.signature}
        aria-label="Powered By Logto"
        href={logtoUrl.toString()}
        target="_blank"
        rel="noopener"
      >
        <span className={styles.text}>Powered by</span>
        <LogtoLogoShadow className={styles.staticIcon} />
        <LogtoLogo className={styles.highlightIcon} />
      </a>
    </div>
  );
};

export default LogtoSignature;
