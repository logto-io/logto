import ReactModal from 'react-modal';

import Button from '@/components/Button';
import DynamicT from '@/components/DynamicT';
import ModalLayout from '@/components/ModalLayout';
import * as modalStyles from '@/scss/modal.module.scss';

import { useContacts } from './hook';
import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  onCancel?: () => void;
};

function ContactModal({ isOpen, onCancel }: Props) {
  const contacts = useContacts();

  return (
    <ReactModal
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
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
                <div className={styles.title}>
                  <DynamicT forKey={title} />
                </div>
                <div className={styles.description}>
                  <DynamicT forKey={description} />
                </div>
              </div>
              <div>
                <Button
                  type="outline"
                  title={label}
                  to={link}
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

export default ContactModal;
