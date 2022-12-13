import type { AdminConsoleKey } from '@logto/phrases';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Eye from '@/assets/images/eye.svg';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import ModalLayout from '@/components/ModalLayout';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from './CreateSuccess.module.scss';

type Props = {
  username: string;
  password: string;
  title: AdminConsoleKey;
  onClose: () => void;
  passwordLabel?: string;
};

const CreateSuccess = ({ username, password, title, onClose, passwordLabel }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleCopy = async () => {
    if (!password) {
      return null;
    }
    await navigator.clipboard.writeText(
      `${t('user_details.created_username')} ${username}\n${
        passwordLabel ?? t('user_details.created_password')
      } ${password}`
    );
    toast.success(t('general.copied'));
  };

  if (!password) {
    return null;
  }

  return (
    <ReactModal
      isOpen
      shouldCloseOnEsc
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        title={title}
        footer={
          <>
            <Button title="general.done" onClick={onClose} />
            <Button type="primary" title="general.copy" onClick={handleCopy} />
          </>
        }
        className={styles.content}
        onClose={onClose}
      >
        <div>{t('user_details.created_guide')}</div>
        <div className={styles.info}>
          <div className={styles.infoLine}>
            <div>{t('user_details.created_username')}</div>
            <div className={styles.infoContent}>{username}</div>
          </div>
          <div className={styles.infoLine}>
            <div>{passwordLabel ?? t('user_details.created_password')}</div>
            <div className={styles.infoContent}>
              {passwordVisible ? password : password.replace(/./g, '*')}
            </div>
            <div className={styles.operation}>
              <IconButton
                onClick={() => {
                  setPasswordVisible((previous) => !previous);
                }}
              >
                <Eye className={styles.eyeIcon} />
              </IconButton>
            </div>
          </div>
        </div>
      </ModalLayout>
    </ReactModal>
  );
};

export default CreateSuccess;
