import React, { MouseEventHandler, ReactNode, useRef, useState } from 'react';
import ReactModal from 'react-modal';

import { Props as ButtonProps } from '../Button';
import ActionMenuButton from './ActionMenuButton';
import * as styles from './index.module.scss';
import usePosition from './use-position';

export { default as ActionMenuItem } from './ActionMenuItem';

type Props = {
  children: ReactNode;
  buttonProps: ButtonProps;
  title?: ReactNode;
};

const ActionMenu = ({ children, buttonProps, title }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorReference = useRef<HTMLDivElement>(null);
  const overlayReference = useRef<HTMLDivElement>(null);

  const {
    position: { left, top },
    mutate,
  } = usePosition(anchorReference, overlayReference);

  const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
    setIsOpen(true);
    // Calc position after modal opened.
    setTimeout(() => {
      mutate();
    });
  };

  return (
    <div className={styles.actionMenu}>
      <ActionMenuButton {...buttonProps} ref={anchorReference} onClick={handleClick} />
      <ReactModal
        shouldCloseOnOverlayClick
        isOpen={isOpen}
        style={{ content: { left: `${left}px`, top: `${top + 4}px` } }}
        className={styles.content}
        overlayClassName={styles.overlay}
        onRequestClose={() => {
          setIsOpen(false);
        }}
      >
        <div ref={overlayReference}>
          {title && <div className={styles.title}>{title}</div>}
          <ul
            className={styles.actionList}
            onClick={() => {
              setIsOpen(false);
            }}
          >
            {children}
          </ul>
        </div>
      </ReactModal>
    </div>
  );
};

export default ActionMenu;
