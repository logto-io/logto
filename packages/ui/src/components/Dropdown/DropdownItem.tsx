import classNames from 'classnames';

import * as styles from './DropdownItem.module.scss';

type Props = {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
};

const DropdownItem = ({ onClick, className, children }: Props) => (
  <li className={classNames(styles.item, className)} onClick={onClick}>
    {children}
  </li>
);

export default DropdownItem;
