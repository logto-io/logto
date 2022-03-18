import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import IconButton from '@/components/IconButton';
import TextInput from '@/components/TextInput';
import useApi from '@/hooks/use-api';
import Close from '@/icons/Close';

import * as styles from './index.module.scss';

type Props = {
  id: string;
  name: string;
  onClose: () => void;
};

const DeleteForm = ({ id, name, onClose }: Props) => {
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const navigate = useNavigate();

  const [inputName, setInputName] = useState('');
  const [loading, setLoading] = useState(false);

  const inputMismatched = inputName !== name;

  const handleDelete = async () => {
    setLoading(true);

    try {
      await api.delete(`/api/applications/${id}`);
      onClose();
      navigate(`/applications`);
      toast.success(t('application_details.application_deleted', { name }));
    } finally {
      setLoading(false);
    }
  };

  return (
    // TODO LOG-1907: Modal
    <Card className={styles.card}>
      <div className={styles.header}>
        <CardTitle title="application_details.reminder" />
        <IconButton size="large" onClick={onClose}>
          <Close />
        </IconButton>
      </div>
      <div className={styles.body}>
        <div className={styles.description}>
          <Trans
            t={t}
            i18nKey="application_details.delete_description"
            values={{ name }}
            components={{ span: <span className={styles.hightlight} /> }}
          />
        </div>
        <TextInput
          value={inputName}
          placeholder={t('application_details.enter_your_application_name')}
          hasError={inputMismatched}
          onChange={(event) => {
            setInputName(event.currentTarget.value);
          }}
        />
      </div>
      <div className={styles.line} />
      <div className={styles.footer}>
        <Button type="outline" title="admin_console.application_details.cancel" onClick={onClose} />
        <Button
          disabled={inputMismatched || loading}
          type="danger"
          title="admin_console.application_details.delete"
          onClick={handleDelete}
        />
      </div>
    </Card>
  );
};

export default DeleteForm;
