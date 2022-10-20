import classNames from 'classnames';
import { ReactNode, RefObject, useRef } from 'react';
import ReactModal from 'react-modal';

import usePosition, { HorizontalAlignment } from '@/hooks/use-position';

import * as styles from './index.module.scss';

export { default as DropdownItem } from './DropdownItem';

type Props = {
  children: ReactNode;
  title?: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  anchorRef: RefObject<HTMLElement>;
  isFullWidth?: boolean;
  className?: string;
  titleClassName?: string;
  horizontalAlign?: HorizontalAlignment;
};

const Dropdown = ({
  children,
  title,
  isOpen,
  onClose,
  anchorRef,
  isFullWidth,
  className,
  titleClassName,
  horizontalAlign = 'end',
}: Props) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const { position, positionState, mutate } = usePosition({
    verticalAlign: 'bottom',
    horizontalAlign,
    offset: { vertical: 4, horizontal: 0 },
    anchorRef,
    overlayRef,
  });

  return (
    <ReactModal
      shouldCloseOnOverlayClick
      isOpen={isOpen}
      style={{
        content: {
          width:
            isFullWidth && anchorRef.current
              ? anchorRef.current.getBoundingClientRect().width
              : undefined,
          ...position,
        },
      }}
      className={classNames(styles.content, positionState.verticalAlign === 'top' && styles.onTop)}
      overlayClassName={styles.overlay}
      onRequestClose={onClose}
      onAfterOpen={mutate}
    >
      <div ref={overlayRef} className={styles.dropdownContainer}>
        {title && <div className={classNames(styles.title, titleClassName)}>{title}</div>}
        <ul className={classNames(styles.list, className)} onClick={onClose}>
          {children}
        </ul>
      </div>
    </ReactModal>
  );
};

export default Dropdown;
