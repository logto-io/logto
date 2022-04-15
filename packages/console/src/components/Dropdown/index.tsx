import React, { ReactNode, RefObject, useRef } from 'react';
import ReactModal from 'react-modal';

import * as styles from './index.module.scss';
import usePosition from './use-position';

export { default as DropdownItem } from './DropdownItem';

type Props = {
  children: ReactNode;
  title?: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  anchorRef: RefObject<HTMLElement>;
  width?: number;
};

const Dropdown = ({ children, title, isOpen, onClose, anchorRef, width }: Props) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const { position, mutate } = usePosition(anchorRef, overlayRef);

  return (
    <ReactModal
      shouldCloseOnOverlayClick
      isOpen={isOpen}
      style={{
        content: position
          ? {
              left: `${position.left}px`,
              top: `${position.top}px`,
              width,
            }
          : { visibility: 'hidden' },
      }}
      className={styles.content}
      overlayClassName={styles.overlay}
      onRequestClose={onClose}
      onAfterOpen={mutate}
    >
      <div ref={overlayRef}>
        {title && <div className={styles.title}>{title}</div>}
        <ul className={styles.list} onClick={onClose}>
          {children}
        </ul>
      </div>
    </ReactModal>
  );
};

export default Dropdown;
