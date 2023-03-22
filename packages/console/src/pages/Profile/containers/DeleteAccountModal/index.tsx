import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';
import ModalLayout from '@/components/ModalLayout';
import TextLink from '@/components/TextLink';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const contactUsEmail = 'contact@logto.io';
const mailToLink = `mailto:${contactUsEmail}?subject=Account%20Deletion%20Request`;

function DeleteAccountModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        title="profile.delete_account.label"
        footer={<Button size="large" title="general.got_it" onClick={onClose} />}
        onClose={onClose}
      >
        <div className={styles.container}>
          <p>{t('profile.delete_account.dialog_paragraph_1')}</p>
          <p>
            <Trans
              components={{
                a: <TextLink href={mailToLink} className={styles.mail} />,
              }}
            >
              {t('profile.delete_account.dialog_paragraph_2', { mail: contactUsEmail })}
            </Trans>
          </p>
          <p>{t('profile.delete_account.dialog_paragraph_3')}</p>
        </div>
      </ModalLayout>
    </ReactModal>
  );
}

export default DeleteAccountModal;
