import type { User } from '@logto/schemas';
import { arbitraryObjectGuard } from '@logto/schemas';
import { useForm, useController } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

import CodeEditor from '@/components/CodeEditor';
import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';
import TextInput from '@/components/TextInput';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import { safeParseJson } from '@/utils/json';
import { uriValidator } from '@/utils/validator';

import UserSocialIdentities from './components/UserSocialIdentities';
import type { UserDetailsForm, UserDetailsOutletContext } from '../types';
import { userDetailsParser } from '../utils';

function UserSettings() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();

  const { user, isDeleting, onUserUpdated } = useOutletContext<UserDetailsOutletContext>();

  const userFormData = userDetailsParser.toLocalForm(user);

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { isSubmitting, errors, isDirty },
    getValues,
  } = useForm<UserDetailsForm>({ defaultValues: userFormData });

  const {
    field: { onChange, value },
  } = useController({ name: 'customData', control });

  const api = useApi();

  const onSubmit = handleSubmit(async (formData) => {
    if (isSubmitting) {
      return;
    }

    const { customData: inputCustomData, name, avatar } = formData;

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
      customData: guardResult.data,
    };

    const updatedUser = await api.patch(`api/users/${user.id}`, { json: payload }).json<User>();
    reset(userDetailsParser.toLocalForm(updatedUser));
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
          learnMoreLink={getDocumentationUrl('/docs/references/users')}
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
            <UserSocialIdentities
              userId={user.id}
              identities={user.identities}
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
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleting && isDirty} />
    </>
  );
}

export default UserSettings;
