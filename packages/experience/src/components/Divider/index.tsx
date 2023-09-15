import classNames from 'classnames';
import type { TFuncKey } from 'i18next';

import DynamicT from '../DynamicT';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  label?: TFuncKey;
};

const Divider = ({ className, label }: Props) => {
  return (
    <div className={classNames(styles.divider, className)}>
      <i className={styles.line} />
      {label && <DynamicT forKey={label} />}
      <i className={styles.line} />
    </div>
  );
};

export default Divider;
