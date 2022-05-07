import { I18nKey } from '@logto/phrases';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../Button';
import ModalLayout from '../ModalLayout';
import * as styles from './index.module.scss';

type Props = {
  title: I18nKey;
  onConfirm: () => void;
  onClose: () => void;
};

const DeleteConfirm = ({ title, onConfirm, onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <ModalLayout
      title="form.confirm"
      footer={
        <>
          <Button type="outline" title="admin_console.form.cancel" onClick={onClose} />
          <Button
            type="danger"
            title="admin_console.form.delete"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          />
        </>
      }
      className={styles.content}
      onClose={onClose}
    >
      <div className={styles.confirmation}>
        {t('admin_console.form.deletion_confirmation', { title: t(title) })}
      </div>
    </ModalLayout>
  );
};

export default DeleteConfirm;
