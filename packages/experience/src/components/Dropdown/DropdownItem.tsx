import classNames from 'classnames';
import type { MouseEvent, KeyboardEvent, ReactNode, Ref } from 'react';
import { forwardRef } from 'react';

import { onKeyDownHandler } from '@/utils/a11y';

import styles from './DropdownItem.module.scss';

export type Props = {
  readonly className?: string;
  readonly children: ReactNode;
  readonly icon?: ReactNode;
  readonly iconClassName?: string;
  readonly type?: 'default' | 'danger';
  readonly onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
  readonly onArrowNavigate?: (direction: 1 | -1) => void;
};

const DropdownItem = (
  {
    className = '',
    children,
    icon,
    iconClassName = '',
    type = 'default',
    onClick,
    onArrowNavigate,
  }: Props,
  ref: Ref<HTMLDivElement>
) => (
  <div
    ref={ref}
    className={classNames(styles.item, styles[type], className)}
    role="menuitem"
    tabIndex={0}
    onMouseDown={(event) => {
      event.preventDefault();
    }}
    onKeyDown={(event) => {
      if (event.key === 'ArrowDown') {
        onArrowNavigate?.(1);
        event.preventDefault();
        return;
      }
      if (event.key === 'ArrowUp') {
        onArrowNavigate?.(-1);
        event.preventDefault();
        return;
      }
      onKeyDownHandler(onClick)(event);
    }}
    onClick={onClick}
  >
    {icon && <span className={classNames(styles.icon, iconClassName)}>{icon}</span>}
    {children}
  </div>
);

export default forwardRef<HTMLDivElement, Props>(DropdownItem);
