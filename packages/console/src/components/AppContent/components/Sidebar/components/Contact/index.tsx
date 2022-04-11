import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';
import ModalLayout from '@/components/ModalLayout';
import * as modalStyles from '@/scss/modal.module.scss';

import { contacts } from './const';
import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  onCancel?: () => void;
};

const Contact = ({ isOpen, onCancel }: Props) => {
  const { t } = useTranslation();

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
    >
      <ModalLayout title="contact.title" subtitle="contact.description" onClose={onCancel}>
        <div className={styles.main}>
          {contacts.map((contact) => (
            <div key={contact.title} className={styles.row}>
              <div className={styles.icon}>
                <img src={contact.icon} alt={contact.title} />
              </div>
              <div className={styles.text}>
                <div className={styles.title}>{t(contact.title)}</div>
                <div className={styles.description}>{t(contact.description)}</div>
              </div>
              <div>
                <Button type="outline" title={contact.label} />
              </div>
            </div>
          ))}
        </div>
      </ModalLayout>
    </ReactModal>
  );
};

export default Contact;
