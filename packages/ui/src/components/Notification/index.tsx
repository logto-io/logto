import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal, { Props as ModalProps } from 'react-modal';

import InfoIcon from '@/assets/icons/info-icon.svg';

import * as styles from './index.module.scss';

type Props = ModalProps & {
  message: string;
  onClose: () => void;
};

const Notification = ({ className, message, onClose, overlayClassName, ...rest }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  return (
    <ReactModal
      className={classNames(styles.notification, className)}
      overlayClassName={classNames(styles.overlay, overlayClassName)}
      ariaHideApp={false}
      parentSelector={() => document.querySelector('main') ?? document.body}
      onRequestClose={onClose}
      {...rest}
    >
      <div className={styles.container}>
        <InfoIcon className={styles.icon} />
        <div className={styles.message}>{message}</div>
        <a className={styles.link} onClick={onClose}>
          {t('action.got_it')}
        </a>
      </div>
    </ReactModal>
  );
};

export default Notification;
