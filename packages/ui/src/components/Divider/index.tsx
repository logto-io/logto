import classNames from 'classnames';
import { TFuncKey, useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  label?: TFuncKey;
};

const Divider = ({ className, label }: Props) => {
  const { t } = useTranslation();

  return (
    <div className={classNames(styles.divider, className)}>
      <i className={styles.line} />
      {label && String(t(label))}
      <i className={styles.line} />
    </div>
  );
};

export default Divider;
