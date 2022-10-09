import classNames from 'classnames';

import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './DropdownItem.module.scss';

type Props = {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
};

const DropdownItem = ({ onClick, className, children }: Props) => (
  <li
    role="menuitem"
    tabIndex={0}
    className={classNames(styles.item, className)}
    onKeyDown={onKeyDownHandler(onClick)}
    onClick={onClick}
  >
    {children}
  </li>
);

export default DropdownItem;
