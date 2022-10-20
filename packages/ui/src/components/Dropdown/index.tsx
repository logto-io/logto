import classNames from 'classnames';
import ReactModal, { Props as ModalProps } from 'react-modal';

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
      <ul className={styles.list} onClick={onClose}>
        {children}
      </ul>
    </ReactModal>
  );
};

export default Dropdown;
