import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import ModalLayout from '@/ds-components/ModalLayout';
import modalStyles from '@/scss/modal.module.scss';

import { useContacts } from './hook';
import styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly onCancel?: () => void;
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
              <a href={link} target="_blank" className={styles.link} rel="noopener">
                <Button type="outline" title={label} className={styles.button} />
              </a>
            </div>
          ))}
        </div>
      </ModalLayout>
    </ReactModal>
  );
}

export default ContactModal;
