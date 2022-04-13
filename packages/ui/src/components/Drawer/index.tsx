import classNames from 'classnames';
import React, { ReactNode } from 'react';
import ReactModal from 'react-modal';

import { ClearIcon } from '@/components/Icons';
import modalStyles from '@/scss/modal.module.scss';

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
      role="dialog"
      isOpen={isOpen}
      className={classNames(modalStyles.drawer, className)}
      overlayClassName={modalStyles.overlay}
      parentSelector={() => document.querySelector('main') ?? document.body}
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
