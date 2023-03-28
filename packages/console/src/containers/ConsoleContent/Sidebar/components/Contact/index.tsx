import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';
import ModalLayout from '@/components/ModalLayout';
import * as modalStyles from '@/scss/modal.module.scss';

import { useContacts } from './hook';
import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  onCancel?: () => void;
};

function Contact({ isOpen, onCancel }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const contacts = useContacts();

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onCancel}
    >
      <ModalLayout title="contact.title" subtitle="contact.description" onClose={onCancel}>
        <div className={styles.main}>
          {contacts.map(({ title, icon: ContactIcon, description, label, link }) => (
            <div key={title} className={styles.row}>
              <div className={styles.icon}>
                <ContactIcon />
              </div>
              <div className={styles.text}>
                <div className={styles.title}>{t(title)}</div>
                <div className={styles.description}>{t(description)}</div>
              </div>
              <div>
                <Button
                  type="outline"
                  title={label}
                  previewLink={link}
                  className={styles.button}
                  onClick={() => window.open(link)}
                />
              </div>
            </div>
          ))}
        </div>
      </ModalLayout>
    </ReactModal>
  );
}

export default Contact;
