import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { type ReactNode, useCallback, useState, useRef } from 'react';

import ArrowRight from '@/assets/icons/arrow-right.svg?react';
import Tick from '@/assets/icons/tick.svg?react';
import { DropdownItem } from '@/ds-components/Dropdown';
import DynamicT from '@/ds-components/DynamicT';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import type { Option } from '@/ds-components/Select';
import Spacer from '@/ds-components/Spacer';
import { onKeyDownHandler } from '@/utils/a11y';

import styles from './index.module.scss';

type Props<T> = {
  readonly className?: string;
  readonly menuItemClassName?: string;
  readonly icon?: ReactNode;
  readonly title: AdminConsoleKey;
  readonly options: Array<Option<T>>;
  readonly selectedOption: T;
  readonly onItemClick: (value: T) => void;
};

const menuItemHeight = 40;
const menuItemMargin = 4;
const menuBorderSize = 1;
const menuBottomMargin = 16;

function SubMenu<T extends string>({
  className,
  menuItemClassName,
  icon,
  title,
  options,
  selectedOption,
  onItemClick,
}: Props<T>) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const mouseEnterTimeoutRef = useRef(0);
  const mouseLeaveTimeoutRef = useRef(0);
  const [menuHeight, setMenuHeight] = useState<number>();

  const calculateDropdownHeight = useCallback(() => {
    if (anchorRef.current) {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const originalMenuHeight =
        options.length * menuItemHeight +
        (options.length + 1) * menuItemMargin +
        2 * menuBorderSize;
      const availableHeight = window.innerHeight - anchorRect.top - menuBottomMargin;

      setMenuHeight(Math.min(originalMenuHeight, availableHeight));
    }
  }, [options.length]);

  return (
    <div
      ref={anchorRef}
      role="button"
      tabIndex={0}
      className={classNames(styles.container, className)}
      onKeyDown={onKeyDownHandler(() => {
        setShowMenu(true);
      })}
      onMouseEnter={() => {
        window.clearTimeout(mouseLeaveTimeoutRef.current);
        calculateDropdownHeight();
        // eslint-disable-next-line @silverhand/fp/no-mutation
        mouseEnterTimeoutRef.current = window.setTimeout(() => {
          setShowMenu(true);
        }, 300);
      }}
      onMouseLeave={() => {
        window.clearTimeout(mouseEnterTimeoutRef.current);
        // eslint-disable-next-line @silverhand/fp/no-mutation
        mouseLeaveTimeoutRef.current = window.setTimeout(() => {
          setShowMenu(false);
        }, 100);
      }}
      onClick={(event) => {
        event.stopPropagation();
        setShowMenu(true);
      }}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.title}>
        <DynamicT forKey={title} />
      </span>
      <Spacer />
      <ArrowRight className={styles.icon} />
      <OverlayScrollbar
        className={classNames(styles.menu, showMenu && styles.visible)}
        style={{ maxHeight: menuHeight }}
      >
        {options.map(({ value, title }) => {
          const selected = value === selectedOption;

          return (
            <DropdownItem
              key={value}
              className={classNames(
                styles.menuOption,
                selected && styles.selected,
                menuItemClassName
              )}
              onClick={() => {
                onItemClick(value);
              }}
            >
              {selected && <Tick className={styles.tick} />}
              {title}
            </DropdownItem>
          );
        })}
      </OverlayScrollbar>
    </div>
  );
}

export default SubMenu;
