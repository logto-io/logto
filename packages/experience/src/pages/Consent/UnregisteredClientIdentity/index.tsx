import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';

type Props = {
  /** The host of the client identifier URL, without scheme or path. */
  readonly host: string;
  readonly className?: string;
};

/**
 * The identity block of an unregistered (CIMD) client: the host of its client identifier, plus a
 * standing notice that Logto has not reviewed the client.
 *
 * The name and the logo are declared by the client itself and can imitate anyone, so the host —
 * which the client cannot forge, it serves the metadata document — has to stay on the page as an
 * identity signal of its own (CIMD draft-02 §8.5).
 */
const UnregisteredClientIdentity = ({ host, className }: Props) => {
  const { t } = useTranslation();

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.host}>{host}</div>
      <div className={styles.notice}>{t('description.unregistered_client_notice')}</div>
    </div>
  );
};

export default UnregisteredClientIdentity;
