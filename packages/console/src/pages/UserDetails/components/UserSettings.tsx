import type { User } from '@logto/schemas';
import { arbitraryObjectGuard } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';
import { useEffect } from 'react';
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
  userData: User;
  userFormData: FormData;
  onUserUpdated: (user?: User) => void;
  isDeleted: boolean;
};

const UserSettings = ({ userData, userFormData, isDeleted, onUserUpdated }: Props) => {
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
    reset(userFormData);
  }, [reset, userFormData]);

  const onSubmit = handleSubmit(async (formData) => {
    if (isSubmitting) {
      return;
    }

    const { customData: inputCustomData, name, avatar, roleNames } = formData;

    const parseResult = safeParseJson(inputCustomData);

    if (!parseResult.success) {
      toast.error(parseResult.error);

      return;
    }

    const guardResult = arbitraryObjectGuard.safeParse(parseResult.data);

    if (!guardResult.success) {
      toast.error(t('user_details.custom_data_invalid'));

      return;
    }

    const payload: Partial<User> = {
      name,
      avatar,
      roleNames,
      customData: guardResult.data,
    };

    const updatedUser = await api
      .patch(`/api/users/${userData.id}`, { json: payload })
      .json<User>();
    onUserUpdated(updatedUser);
    toast.success(t('general.saved'));
  });

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.fields}>
        {getValues('primaryEmail') && (
          <FormField title="user_details.field_email" className={styles.textField}>
            <TextInput readOnly {...register('primaryEmail')} />
          </FormField>
        )}
        {getValues('primaryPhone') && (
          <FormField title="user_details.field_phone" className={styles.textField}>
            <TextInput readOnly {...register('primaryPhone')} />
          </FormField>
        )}
        {getValues('username') && (
          <FormField title="user_details.field_username" className={styles.textField}>
            <TextInput readOnly {...register('username')} />
          </FormField>
        )}
        <FormField title="user_details.field_name" className={styles.textField}>
          <TextInput {...register('name')} />
        </FormField>
        <FormField title="user_details.field_avatar" className={styles.textField}>
          <TextInput
            {...register('avatar', {
              validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
            })}
            hasError={Boolean(errors.avatar)}
            errorMessage={errors.avatar?.message}
            placeholder={t('user_details.field_avatar_placeholder')}
          />
        </FormField>
        <FormField title="user_details.field_connectors" className={styles.textField}>
          <UserConnectors
            userId={userData.id}
            connectors={userData.identities}
            onDelete={() => {
              onUserUpdated();
            }}
          />
        </FormField>
        <FormField
          isRequired
          title="user_details.field_custom_data"
          className={styles.textField}
          tooltip="user_details.field_custom_data_tip"
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
            title="general.save_changes"
            size="large"
          />
        </div>
      </div>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </form>
  );
};

export default UserSettings;
