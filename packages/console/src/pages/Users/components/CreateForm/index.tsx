import { User } from '@logto/schemas';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import ModalLayout from '@/components/ModalLayout';
import TextInput from '@/components/TextInput';
import useApi from '@/hooks/use-api';

type FormData = {
  username: string;
  password: string;
  name: string;
};

type Props = {
  onClose?: (createdUser?: User, password?: string) => void;
};

const CreateForm = ({ onClose }: Props) => {
  const { handleSubmit, register } = useForm<FormData>();
  const api = useApi();

  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const createdUser = await api.post('/api/users', { json: data }).json<User>();
      onClose?.(createdUser, btoa(data.password));
    } finally {
      setLoading(false);
    }
  });

  return (
    <ModalLayout
      title="users.create"
      subtitle="users.subtitle"
      footer={
        <Button
          disabled={loading}
          htmlType="submit"
          title="admin_console.users.create"
          size="large"
          type="primary"
          onClick={onSubmit}
        />
      }
      onClose={onClose}
    >
      <form>
        <FormField isRequired title="admin_console.users.create_form_username">
          <TextInput {...register('username', { required: true })} />
        </FormField>
        <FormField isRequired title="admin_console.users.create_form_name">
          <TextInput {...register('name', { required: true })} />
        </FormField>
        <FormField isRequired title="admin_console.users.create_form_password">
          <TextInput {...register('password', { required: true })} />
        </FormField>
      </form>
    </ModalLayout>
  );
};

export default CreateForm;
