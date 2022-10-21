import classNames from 'classnames';
import type { Props as ModalProps } from 'react-modal';
import ReactModal from 'react-modal';

import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

export { default as DropdownItem } from './DropdownItem';

type Props = ModalProps & {
  onClose?: () => void;
};

const Dropdown = ({ onClose, children, className, ...rest }: Props) => {
  return (
    <ReactModal
      shouldCloseOnOverlayClick
      className={classNames(styles.content, className)}
      overlayClassName={styles.overlay}
      ariaHideApp={false}
      onRequestClose={onClose}
      {...rest}
    >
      <ul
        role="menu"
        tabIndex={0}
        className={styles.list}
        onKeyDown={onKeyDownHandler({
          Esc: onClose,
          Enter: onClose,
          ' ': onClose,
        })}
        onClick={onClose}
      >
        {children}
      </ul>
    </ReactModal>
  );
};

export default Dropdown;
