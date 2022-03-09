import { Resource } from '@logto/schemas';
import ky from 'ky';
import React from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import FormField from '@/components/FormField';
import TextInput from '@/components/TextInput';
import Close from '@/icons/Close';

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

  const onSubmit = handleSubmit(async (data) => {
    try {
      const createdApiResource = await ky.post('/api/resources', { json: data }).json<Resource>();
      onClose?.(createdApiResource);
    } catch (error: unknown) {
      console.error(error);
    }
  });

  return (
    <Card className={styles.card}>
      <div className={styles.headline}>
        <CardTitle title="api_resources.create" subtitle="api_resources.subtitle" />
        <Close onClick={() => onClose?.()} />
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
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
        <div className={styles.submit}>
          <Button htmlType="submit" title="admin_console.api_resources.create" size="large" />
        </div>
      </form>
    </Card>
  );
};

export default CreateForm;
