import type { User } from '@logto/schemas';
import { arbitraryObjectGuard } from '@logto/schemas';
import { useEffect } from 'react';
import { useForm, useController } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import CodeEditor from '@/components/CodeEditor';
import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';
import TextInput from '@/components/TextInput';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import { safeParseJson } from '@/utilities/json';
import { uriValidator } from '@/utilities/validator';

import type { UserDetailsForm } from '../types';
import UserConnectors from './UserConnectors';

type Props = {
  userData: User;
  userFormData: UserDetailsForm;
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
  } = useForm<UserDetailsForm>();

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
    <>
      <DetailsForm
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        onSubmit={onSubmit}
        onDiscard={reset}
      >
        <FormCard
          title="user_details.settings"
          description="user_details.settings_description"
          learnMoreLink="https://docs.logto.io/docs/references/users"
        >
          {getValues('primaryEmail') && (
            <FormField title="user_details.field_email">
              <TextInput readOnly {...register('primaryEmail')} />
            </FormField>
          )}
          {getValues('primaryPhone') && (
            <FormField title="user_details.field_phone">
              <TextInput readOnly {...register('primaryPhone')} />
            </FormField>
          )}
          {getValues('username') && (
            <FormField title="user_details.field_username">
              <TextInput readOnly {...register('username')} />
            </FormField>
          )}
          <FormField title="user_details.field_name">
            <TextInput {...register('name')} />
          </FormField>
          <FormField title="user_details.field_avatar">
            <TextInput
              {...register('avatar', {
                validate: (value) =>
                  !value || uriValidator(value) || t('errors.invalid_uri_format'),
              })}
              hasError={Boolean(errors.avatar)}
              errorMessage={errors.avatar?.message}
              placeholder={t('user_details.field_avatar_placeholder')}
            />
          </FormField>
          <FormField title="user_details.field_connectors">
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
            tip={t('user_details.field_custom_data_tip')}
          >
            <CodeEditor language="json" value={value} onChange={onChange} />
          </FormField>
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </>
  );
};

export default UserSettings;
