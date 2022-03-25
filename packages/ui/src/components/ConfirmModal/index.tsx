import { I18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from './index.module.scss';

type Props = {
  classname?: string;
  isOpen?: boolean;
  children: ReactNode;
  cancelText?: I18nKey;
  confirmText?: I18nKey;
  onConfirm?: () => void;
  onClose: () => void;
};

const ConfirmModal = ({
  classname,
  isOpen = false,
  children,
  cancelText = 'general.cancel',
  confirmText = 'general.confirm',
  onConfirm,
  onClose,
}: Props) => {
  const { t } = useTranslation();

  return (
    <ReactModal
      role="dialog"
      isOpen={isOpen}
      className={classNames(modalStyles.modal, classname)}
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
