import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import IconButton from '@/components/IconButton';
import useApi from '@/hooks/use-api';
import Close from '@/icons/Close';

import * as styles from './DeleteForm.module.scss';

type Props = {
  id: string;
  onClose: () => void;
};

const DeleteForm = ({ id, onClose }: Props) => {
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      await api.delete(`/api/users/${id}`);
      onClose();
      navigate('/users');
      toast.success(t('user_details.deleted', { name }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <CardTitle title="user_details.delete_title" />
        <IconButton size="large" onClick={onClose}>
          <Close />
        </IconButton>
      </div>
      <div className={styles.description}>{t('user_details.delete_description')}</div>
      <div className={styles.footer}>
        <Button type="outline" title="admin_console.user_details.delete_cancel" onClick={onClose} />
        <Button
          disabled={loading}
          type="danger"
          title="admin_console.user_details.delete_confirm"
          onClick={handleDelete}
        />
      </div>
    </Card>
  );
};

export default DeleteForm;
