import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

function NotSet() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return <span className={styles.text}>{t('profile.not_set')}</span>;
}

export default NotSet;
