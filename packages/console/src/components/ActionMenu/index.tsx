import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

import type { HorizontalAlignment } from '@/types/positioning';

import type { Props as ButtonProps } from '../Button';
import Dropdown from '../Dropdown';
import ActionMenuButton from './ActionMenuButton';
import * as styles from './index.module.scss';

export { default as ActionMenuItem } from '../Dropdown/DropdownItem';

type Props = {
  children: ReactNode;
  buttonProps: ButtonProps;
  title?: ReactNode;
  dropdownHorizontalAlign?: HorizontalAlignment;
  dropdownClassName?: string;
  isDropdownFullWidth?: boolean;
};

function ActionMenu({
  children,
  buttonProps,
  title,
  dropdownHorizontalAlign,
  dropdownClassName,
  isDropdownFullWidth = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const anchorReference = useRef<HTMLDivElement>(null);

  return (
    <div>
      <ActionMenuButton
        {...buttonProps}
        ref={anchorReference}
        onClick={() => {
          setIsOpen(true);
        }}
      />
      <Dropdown
        title={title}
        titleClassName={styles.dropdownTitle}
        anchorRef={anchorReference}
        isOpen={isOpen}
        className={classNames(styles.content, dropdownClassName)}
        horizontalAlign={dropdownHorizontalAlign}
        isFullWidth={isDropdownFullWidth}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        {children}
      </Dropdown>
    </div>
  );
}

export default ActionMenu;
