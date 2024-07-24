import classNames from 'classnames';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly name: string;
  /* If the text in this component is displayed in monospace font. Defaults to `true` */
  readonly isMonospace?: boolean;
};

function Permission({ className, name, isMonospace = true }: Props) {
  return (
    <div className={classNames(styles.permission, isMonospace && styles.monoSpace, className)}>
      {name}
    </div>
  );
}

export default Permission;
