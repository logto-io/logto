import classNames from 'classnames';
import type { TFuncKey } from 'react-i18next';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  message: TFuncKey;
};

const InlineNotification = ({ className, message }: Props) => {
  const { t } = useTranslation();

  return <div className={classNames(styles.notification, className)}>{t(message)}</div>;
};

export default InlineNotification;
