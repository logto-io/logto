import { ReactNode, useRef, useState } from 'react';

import { Props as ButtonProps } from '../Button';
import Dropdown from '../Dropdown';
import ActionMenuButton from './ActionMenuButton';
import * as styles from './index.module.scss';

export { default as ActionMenuItem } from '../Dropdown/DropdownItem';

type Props = {
  children: ReactNode;
  buttonProps: ButtonProps;
  title?: ReactNode;
};

const ActionMenu = ({ children, buttonProps, title }: Props) => {
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
        anchorRef={anchorReference}
        isOpen={isOpen}
        className={styles.content}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        {children}
      </Dropdown>
    </div>
  );
};

export default ActionMenu;
