import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import slack from '@/assets/images/slack.svg';
import Button from '@/components/Button';
import ModalLayout from '@/components/ModalLayout';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  onCancel?: () => void;
};

const Contact = ({ isOpen, onCancel }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
    >
      <ModalLayout title="contact.title" subtitle="contact.description" onClose={onCancel}>
        <div className={styles.main}>
          <div className={styles.row}>
            <div className={styles.icon}>
              <img src={slack} alt="slack" />
            </div>
            <div className={styles.text}>
              <div className={styles.title}>{t('contact.slack.title')}</div>
              <div className={styles.description}>{t('contact.slack.description')}</div>
            </div>
            <div>
              <Button type="outline" title="admin_console.contact.slack.button" />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.icon}>
              <img src={slack} alt="github" />
            </div>
            <div className={styles.text}>
              <div className={styles.title}>{t('contact.github.title')}</div>
              <div className={styles.description}>{t('contact.github.description')}</div>
            </div>
            <div>
              <Button type="outline" title="admin_console.contact.github.button" />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.icon}>
              <img src={slack} alt="email" />
            </div>
            <div className={styles.text}>
              <div className={styles.title}>{t('contact.email.title')}</div>
              <div className={styles.description}>{t('contact.email.description')}</div>
            </div>
            <div>
              <Button type="outline" title="admin_console.contact.email.button" />
            </div>
          </div>
        </div>
      </ModalLayout>
    </ReactModal>
  );
};

export default Contact;
