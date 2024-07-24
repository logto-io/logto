import { type SsoConnectorProviderDetail, Theme } from '@logto/schemas';
import classNames from 'classnames';

import ImageWithErrorFallback from '@/ds-components/ImageWithErrorFallback';
import useTheme from '@/hooks/use-theme';

import styles from './index.module.scss';

type Props = {
  readonly data: SsoConnectorProviderDetail;
};

function SsoConnectorRadio({ data: { logo, logoDark, description, name } }: Props) {
  const theme = useTheme();
  return (
    <div className={styles.ssoConnector}>
      <ImageWithErrorFallback
        containerClassName={styles.container}
        className={styles.logo}
        alt="logo"
        src={theme === Theme.Light ? logo : logoDark}
      />
      <div className={styles.content}>
        <div className={classNames(styles.name)}>
          <span>{name}</span>
        </div>
        <div className={styles.description}>
          <span>{description}</span>
        </div>
      </div>
    </div>
  );
}

export default SsoConnectorRadio;
