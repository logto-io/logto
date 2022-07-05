import { User } from '@logto/schemas';
import { Nullable } from '@silverhand/essentials';
import React, { useEffect } from 'react';
import { useForm, useController } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import CodeEditor from '@/components/CodeEditor';
import FormField from '@/components/FormField';
import TextInput from '@/components/TextInput';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import * as detailsStyles from '@/scss/details.module.scss';
import { safeParseJson } from '@/utilities/json';
import { uriValidator } from '@/utilities/validator';

import * as styles from '../index.module.scss';
import UserConnectors from './UserConnectors';

type FormData = {
  primaryEmail: Nullable<string>;
  primaryPhone: Nullable<string>;
  username: Nullable<string>;
  name: Nullable<string>;
  avatar: Nullable<string>;
  roleNames: string[];
  customData: string;
};

type Props = {
  data: User;
  onMutate: (user?: User) => void;
};

const UserSettingsForm = ({ data, onMutate }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { isSubmitting, errors, isDirty },
    getValues,
  } = useForm<FormData>();

  const {
    field: { onChange, value },
  } = useController({ name: 'customData', control });

  const api = useApi();

  useEffect(() => {
    const defaultData = {
      ...data,
      customData: JSON.stringify(data.customData, null, 2),
    };
    reset(defaultData);

    return () => {
      reset(defaultData);
    };
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    if (isSubmitting) {
      return;
    }

    const { customData: inputtedCustomData, name, avatar, roleNames } = formData;

    const customData = inputtedCustomData ? safeParseJson(inputtedCustomData) : {};

    if (!customData) {
      toast.error(t('user_details.custom_data_invalid'));

      return;
    }

    const payload: Partial<User> = {
      name,
      avatar,
      roleNames,
      customData,
    };

    const updatedUser = await api.patch(`/api/users/${data.id}`, { json: payload }).json<User>();
    onMutate(updatedUser);
    toast.success(t('general.saved'));
  });

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.fields}>
        {getValues('primaryEmail') && (
          <FormField title="admin_console.user_details.field_email" className={styles.textField}>
            <TextInput readOnly {...register('primaryEmail')} />
          </FormField>
        )}
        {getValues('primaryPhone') && (
          <FormField title="admin_console.user_details.field_phone" className={styles.textField}>
            <TextInput readOnly {...register('primaryPhone')} />
          </FormField>
        )}
        {getValues('username') && (
          <FormField title="admin_console.user_details.field_username" className={styles.textField}>
            <TextInput readOnly {...register('username')} />
          </FormField>
        )}
        <FormField title="admin_console.user_details.field_name" className={styles.textField}>
          <TextInput {...register('name')} />
        </FormField>
        <FormField title="admin_console.user_details.field_avatar" className={styles.textField}>
          <TextInput
            {...register('avatar', {
              validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
            })}
            hasError={Boolean(errors.avatar)}
            errorMessage={errors.avatar?.message}
            placeholder={t('user_details.field_avatar_placeholder')}
          />
        </FormField>
        <FormField title="admin_console.user_details.field_connectors" className={styles.textField}>
          <UserConnectors
            userId={data.id}
            connectors={data.identities}
            onDelete={() => {
              onMutate();
            }}
          />
        </FormField>
        <FormField
          isRequired
          title="admin_console.user_details.field_custom_data"
          className={styles.textField}
        >
          <CodeEditor language="json" value={value} onChange={onChange} />
        </FormField>
      </div>
      <div className={detailsStyles.footer}>
        <div className={detailsStyles.footerMain}>
          <Button
            isLoading={isSubmitting}
            htmlType="submit"
            type="primary"
            title="admin_console.general.save_changes"
            size="large"
          />
        </div>
      </div>
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </form>
  );
};

export default UserSettingsForm;
