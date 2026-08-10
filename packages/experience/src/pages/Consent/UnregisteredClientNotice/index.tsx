import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';

import InfoIcon from '@/assets/icons/info-icon.svg?react';

import styles from './index.module.scss';

type Props = {
  /** The host of the client identifier URL, without scheme or path. */
  readonly host: string;
  readonly className?: string;
};

/**
 * The standing notice for an unregistered (CIMD) client: everything the page shows about the
 * client is self-declared, and the host of its client identifier is the one part that is not.
 *
 * The name and the logo can imitate anyone, so the host — which the client cannot forge, it serves
 * the metadata document — has to stay on the page as an identity signal of its own, and the user
 * has to be told to read it (CIMD draft-02 §8.5).
 */
const UnregisteredClientNotice = ({ host, className }: Props) => {
  const { t } = useTranslation();

  return (
    <div className={classNames(styles.notice, className)}>
      <InfoIcon className={styles.icon} />
      <div>
        <Trans components={{ hostname: <span className={styles.host} /> }}>
          {t('description.unregistered_client_notice', { host })}
        </Trans>
      </div>
    </div>
  );
};

export default UnregisteredClientNotice;
