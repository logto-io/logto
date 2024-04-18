import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

import type { HorizontalAlignment } from '@/types/positioning';

import type { Props as ButtonProps } from '../Button';
import Button from '../Button';
import Dropdown from '../Dropdown';
import IconButton from '../IconButton';

import * as styles from './index.module.scss';

export { default as ActionMenuItem } from '../Dropdown/DropdownItem';

type BaseProps = {
  children: ReactNode;
  title?: ReactNode;
  dropdownHorizontalAlign?: HorizontalAlignment;
  dropdownClassName?: string;
  isDropdownFullWidth?: boolean;
};

type Props =
  | (BaseProps & {
      buttonProps: ButtonProps;
    })
  | (BaseProps & {
      icon: ReactNode;
      iconSize?: 'small' | 'medium' | 'large';
    });

/**
 * A button that can be used to open and close a dropdown menu.
 *
 * @param props If `buttonProps` is provided, the button will be rendered using the `ActionMenuButton`
 * component. Otherwise, `icon` will be required to render the button using the `IconButton`
 * component.
 * @see {@link ActionMenuButton} for the list of props that can be passed to the button.
 * @see {@link IconButton} for how the button will be rendered if `icon` is provided.
 */
function ActionMenu(props: Props) {
  const {
    children,
    title,
    dropdownHorizontalAlign,
    dropdownClassName,
    isDropdownFullWidth = false,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const anchorReference = useRef(null);
  const hasButtonProps = 'buttonProps' in props;

  return (
    <div>
      {hasButtonProps && (
        <Button
          {...props.buttonProps}
          ref={anchorReference}
          className={styles.actionMenuButton}
          onClick={() => {
            setIsOpen(true);
          }}
        />
      )}
      {!hasButtonProps && (
        <IconButton
          ref={anchorReference}
          size={props.iconSize}
          onClick={() => {
            setIsOpen(true);
          }}
        >
          {props.icon}
        </IconButton>
      )}
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
