import { User } from '@logto/schemas';
import React from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import FormField from '@/components/FormField';
import IconButton from '@/components/IconButton';
import TextInput from '@/components/TextInput';
import useApi from '@/hooks/use-api';
import Close from '@/icons/Close';

import * as styles from './ChangePasswordForm.module.scss';

type FormData = {
  password: string;
};

type Props = {
  userId: string;
  onClose?: () => void;
};

const ChangePasswordForm = ({ onClose, userId }: Props) => {
  const { handleSubmit, register } = useForm<FormData>();
  const api = useApi();

  const onSubmit = handleSubmit(async (data) => {
    await api.patch(`/api/users/${userId}/password`, { json: data }).json<User>();
    onClose?.();
  });

  return (
    <Card className={styles.card}>
      <div className={styles.headline}>
        <CardTitle title="user_details.change_password.title" />
        <IconButton size="large" onClick={() => onClose?.()}>
          <Close />
        </IconButton>
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <FormField
          isRequired
          title="admin_console.user_details.change_password.label"
          className={styles.textField}
        >
          <TextInput {...register('password', { required: true })} />
        </FormField>
        <div className={styles.submit}>
          <Button
            htmlType="submit"
            title="admin_console.user_details.change_password.change_password"
            size="large"
            type="primary"
          />
        </div>
      </form>
    </Card>
  );
};

export default ChangePasswordForm;
