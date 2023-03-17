import { Theme } from '@logto/schemas';
import { useContext } from 'react';

import LogtoLogtoDark from '@/assets/icons/logto-logo-dark.svg';
import LogtoLogoLight from '@/assets/icons/logto-logo-light.svg';
import LogtoLogoShadow from '@/assets/icons/logto-logo-shadow.svg';
import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';

const logtoUrl = new URL(
  `https://logto.io?${new URLSearchParams({
    src: window.location.href,
  }).toString()}`
);

type Props = {
  className?: string;
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
