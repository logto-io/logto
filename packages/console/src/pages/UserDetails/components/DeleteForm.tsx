import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import ModalLayout from '@/components/ModalLayout';
import useApi from '@/hooks/use-api';

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
    <ModalLayout
      title="general.reminder"
      footer={
        <>
          <Button type="outline" title="general.cancel" onClick={onClose} />
          <Button disabled={loading} type="danger" title="general.delete" onClick={handleDelete} />
        </>
      }
      onClose={onClose}
    >
      <div>{t('user_details.delete_description')}</div>
    </ModalLayout>
  );
};

export default DeleteForm;
