import { User } from '@logto/schemas';
import React from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import FormField from '@/components/FormField';
import IconButton from '@/components/IconButton';
import TextInput from '@/components/TextInput';
import Close from '@/icons/Close';
import api from '@/utilities/api';

import * as styles from './index.module.scss';

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

  const onSubmit = handleSubmit(async (data) => {
    const createdUser = await api.post('/api/users', { json: data }).json<User>();
    onClose?.(createdUser, btoa(data.password));
  });

  return (
    <Card className={styles.card}>
      <div className={styles.headline}>
        <CardTitle title="users.create" subtitle="users.subtitle" />
        <IconButton size="large" onClick={() => onClose?.()}>
          <Close />
        </IconButton>
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <FormField
          isRequired
          title="admin_console.users.create_form_username"
          className={styles.textField}
        >
          <TextInput {...register('username', { required: true })} />
        </FormField>
        <FormField
          isRequired
          title="admin_console.users.create_form_name"
          className={styles.textField}
        >
          <TextInput {...register('name', { required: true })} />
        </FormField>
        <FormField
          isRequired
          title="admin_console.users.create_form_password"
          className={styles.textField}
        >
          <TextInput {...register('password', { required: true })} />
        </FormField>
        <div className={styles.submit}>
          <Button
            htmlType="submit"
            title="admin_console.users.create"
            size="large"
            type="primary"
          />
        </div>
      </form>
    </Card>
  );
};

export default CreateForm;
