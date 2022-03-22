import { Resource } from '@logto/schemas';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import ModalLayout from '@/components/ModalLayout';
import TextInput from '@/components/TextInput';
import useApi from '@/hooks/use-api';

import * as styles from './index.module.scss';

type FormData = {
  name: string;
  indicator: string;
};

type Props = {
  onClose?: (createdApiResource?: Resource) => void;
};

const CreateForm = ({ onClose }: Props) => {
  const { handleSubmit, register } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const api = useApi();

  const onSubmit = handleSubmit(async (data) => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const createdApiResource = await api.post('/api/resources', { json: data }).json<Resource>();
      onClose?.(createdApiResource);
    } finally {
      setLoading(false);
    }
  });

  return (
    <ModalLayout
      title="api_resources.create"
      subtitle="api_resources.subtitle"
      footer={
        <div className={styles.submit}>
          <Button
            disabled={loading}
            htmlType="submit"
            title="admin_console.api_resources.create"
            size="large"
            type="primary"
            onClick={onSubmit}
          />
        </div>
      }
      onClose={onClose}
    >
      <form className={styles.form}>
        <FormField
          isRequired
          title="admin_console.api_resources.api_name"
          className={styles.textField}
        >
          <TextInput {...register('name', { required: true })} />
        </FormField>
        <FormField
          isRequired
          title="admin_console.api_resources.api_identifier"
          className={styles.textField}
        >
          <TextInput {...register('indicator', { required: true })} />
        </FormField>
      </form>
    </ModalLayout>
  );
};

export default CreateForm;
