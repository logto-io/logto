import classNames from 'classnames';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

function Divider({ className }: Props) {
  return <div className={classNames(styles.divider, className)} />;
}

export default Divider;
