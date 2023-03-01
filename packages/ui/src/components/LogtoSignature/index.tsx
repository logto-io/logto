import classNames from 'classnames';
import { useContext } from 'react';

import LogtoLogtoDark from '@/assets/icons/logto_logo_dark.svg';
import LogtoLogoLight from '@/assets/icons/logto_logo_light.svg';
import LogtoLogoShadow from '@/assets/icons/logto_logo_shadow.svg';
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

  return (
    <a
      className={classNames(styles.signature, className)}
      aria-label="Powered By Logto"
      href={logtoUrl.toString()}
      target="_blank"
      rel="noopener"
    >
      <span className={styles.text}>Powered by</span>
      <LogtoLogoShadow className={styles.staticIcon} />
      {theme === 'light' ? (
        <LogtoLogoLight className={styles.highlightIcon} />
      ) : (
        <LogtoLogtoDark className={styles.highlightIcon} />
      )}
    </a>
  );
};

export default LogtoSignature;
