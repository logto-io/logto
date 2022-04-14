import classNames from 'classnames';
import React, { ReactNode } from 'react';
import ReactModal from 'react-modal';

import { ClearIcon } from '@/components/Icons';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  isOpen?: boolean;
  children: ReactNode;
  onClose: () => void;
};

const Drawer = ({ className, isOpen = false, children, onClose }: Props) => {
  return (
    <ReactModal
      shouldCloseOnOverlayClick
      role="popup"
      isOpen={isOpen}
      className={classNames(modalStyles.drawer, className)}
      overlayClassName={modalStyles.overlay}
      parentSelector={() => document.querySelector('main') ?? document.body}
      appElement={document.querySelector('main') ?? document.body}
      closeTimeoutMS={300}
      onRequestClose={onClose}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <ClearIcon onClick={onClose} />
        </div>
        {children}
      </div>
    </ReactModal>
  );
};

export default Drawer;
