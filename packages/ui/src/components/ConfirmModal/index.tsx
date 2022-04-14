import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { TFuncKey, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';

import * as modalStyles from '../../scss/modal.module.scss';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  isOpen?: boolean;
  children: ReactNode;
  cancelText?: TFuncKey<'translation', 'main_flow'>;
  confirmText?: TFuncKey<'translation', 'main_flow'>;
  onConfirm?: () => void;
  onClose: () => void;
};

const ConfirmModal = ({
  className,
  isOpen = false,
  children,
  cancelText = 'action.cancel',
  confirmText = 'action.confirm',
  onConfirm,
  onClose,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  return (
    <ReactModal
      role="dialog"
      isOpen={isOpen}
      className={classNames(modalStyles.modal, className)}
      overlayClassName={modalStyles.overlay}
      parentSelector={() => document.querySelector('main') ?? document.body}
    >
      <div className={styles.container}>
        <div className={styles.content}>{children}</div>
        <div className={styles.footer}>
          <Button type="secondary" size="small" onClick={onClose}>
            {t(cancelText)}
          </Button>
          <Button size="small" onClick={onConfirm ?? onClose}>
            {t(confirmText)}
          </Button>
        </div>
      </div>
    </ReactModal>
  );
};

export default ConfirmModal;
