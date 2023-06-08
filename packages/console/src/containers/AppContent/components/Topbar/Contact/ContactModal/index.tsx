import ReactModal from 'react-modal';

import Button from '@/components/Button';
import DynamicT from '@/components/DynamicT';
import ModalLayout from '@/components/ModalLayout';
import { isCloud } from '@/consts/env';
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
          {contacts
            .filter(({ isVisibleToCloud }) => (isCloud ? isVisibleToCloud : true))
            .map(({ title, icon: ContactIcon, description, label, link }) => (
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
