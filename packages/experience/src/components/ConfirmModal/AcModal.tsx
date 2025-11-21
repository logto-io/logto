import classNames from 'classnames';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import CloseIcon from '@/assets/icons/close-icon.svg?react';
import Button from '@/shared/components/Button';
import IconButton from '@/shared/components/IconButton';
import { onKeyDownHandler } from '@/shared/utils/a11y';

import modalStyles from '../../scss/modal.module.scss';

import styles from './Acmodal.module.scss';
import type { ModalProps } from './type';

const AcModal = ({
  className,
  isOpen = false,
  isConfirmLoading = false,
  isCancelLoading = false,
  children,
  cancelText = 'action.cancel',
  confirmText = 'action.confirm',
  confirmTextI18nProps,
  cancelTextI18nProps,
  shouldCloseOnOverlayClick = true,
  shouldCloseOnEsc = true,
  onConfirm,
  onClose,
}: ModalProps) => {
  const { t } = useTranslation();

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <ReactModal
      shouldCloseOnEsc={shouldCloseOnEsc}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      role="dialog"
      isOpen={isOpen}
      className={classNames(styles.modal, className)}
      overlayClassName={classNames(modalStyles.overlay, styles.overlay)}
      onAfterOpen={() => {
        contentRef.current?.focus();
      }}
      onRequestClose={onClose}
    >
      <div
        ref={contentRef}
        className={styles.container}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDownHandler({
          Enter: onConfirm ?? onClose,
          ' ': onConfirm ?? onClose,
          Escape: onClose,
        })}
      >
        <div className={styles.header}>
          {t('description.reminder')}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className={styles.content}>{children}</div>
        <div className={styles.footer}>
          <Button
            title={cancelText}
            type="secondary"
            i18nProps={cancelTextI18nProps}
            size="small"
            isLoading={isCancelLoading}
            onClick={onClose}
          />
          {onConfirm && (
            <Button
              title={confirmText}
              i18nProps={confirmTextI18nProps}
              size="small"
              isLoading={isConfirmLoading}
              onClick={onConfirm}
            />
          )}
        </div>
      </div>
    </ReactModal>
  );
};

export default AcModal;
