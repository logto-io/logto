import classNames from 'classnames';
import type { TFuncKey } from 'i18next';

import DynamicT from '../DynamicT';

import * as styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly label?: TFuncKey;
};

const Divider = ({ className, label }: Props) => {
  const lineStyle = classNames(styles.line, label && styles.withLabel);

  return (
    <div className={classNames(styles.divider, className)}>
      <i className={lineStyle} />
      {label && (
        <>
          <DynamicT forKey={label} />
          <i className={lineStyle} />
        </>
      )}
    </div>
  );
};

export default Divider;
