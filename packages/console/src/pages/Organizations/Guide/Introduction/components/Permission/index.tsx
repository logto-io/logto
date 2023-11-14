import classNames from 'classnames';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  name: string;
  /* If the text in this component is displayed in monospace font. Defaults to `true` */
  isMonospace?: boolean;
};

function Permission({ className, name, isMonospace = true }: Props) {
  return (
    <div className={classNames(styles.permission, isMonospace && styles.monoSpace, className)}>
      <div className={styles.name}>{name}</div>
    </div>
  );
}

export default Permission;
