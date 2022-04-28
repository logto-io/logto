import { SignInExperience } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ModalLayout from '@/components/ModalLayout';

import * as styles from './SaveAlert.module.scss';
import SignInMethodsPreview from './SignInMethodsPreview';

type Props = {
  before: SignInExperience;
  after: SignInExperience;
  onClose: () => void;
  onConfirm: () => void;
};

const SaveAlert = ({ before, after, onClose, onConfirm }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <ModalLayout
      title="sign_in_exp.save_alert.title"
      footer={
        <>
          <Button type="outline" title="general.cancel" onClick={onClose} />
          <Button
            type="danger"
            title="general.confirm"
            onClick={() => {
              onClose();
              onConfirm();
            }}
          />
        </>
      }
      onClose={onClose}
    >
      <div className={styles.description}>{t('sign_in_exp.save_alert.description')}</div>
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.title}>{t('sign_in_exp.save_alert.before')}</div>
          <SignInMethodsPreview data={before} />
        </div>
        <div className={styles.section}>
          <div className={styles.title}>{t('sign_in_exp.save_alert.after')}</div>
          <SignInMethodsPreview data={after} />
        </div>
      </div>
    </ModalLayout>
  );
};

export default SaveAlert;
