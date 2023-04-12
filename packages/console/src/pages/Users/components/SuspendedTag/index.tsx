import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
};

function SuspendedTag({ className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={classNames(styles.suspended, className)}>{t('user_details.suspended')}</div>
  );
}

export default SuspendedTag;
