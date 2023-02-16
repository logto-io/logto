import classNames from 'classnames';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
};

const Divider = ({ className }: Props) => <div className={classNames(styles.divider, className)} />;

export default Divider;
