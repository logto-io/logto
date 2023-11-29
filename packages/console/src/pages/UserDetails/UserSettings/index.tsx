import { emailRegEx, usernameRegEx } from '@logto/core-kit';
import type { User } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { useForm, useController } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { isDevFeaturesEnabled } from '@/consts/env';
import CodeEditor from '@/ds-components/CodeEditor';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import { trySubmitSafe } from '@/utils/form';
import { safeParseJsonObject } from '@/utils/json';
import { parsePhoneNumber } from '@/utils/phone';
import { uriValidator } from '@/utils/validator';

import { type UserDetailsForm, type UserDetailsOutletContext } from '../types';
import { userDetailsParser } from '../utils';

import UserMfaVerifications from './UserMfaVerifications';
import UserSocialIdentities from './components/UserSocialIdentities';
import UserSsoIdentities from './components/UserSsoIdentities';

function UserSettings() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const { show } = useConfirmModal();
  const { user, isDeleting, onUserUpdated } = useOutletContext<UserDetailsOutletContext>();

  const userFormData = userDetailsParser.toLocalForm(user);

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<UserDetailsForm>({ defaultValues: userFormData });

  const {
    field: { onChange, value },
  } = useController({ name: 'customData', control });

  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }
      const { identities, id: userId } = user;
      const { customData: inputCustomData, username, primaryEmail, primaryPhone } = formData;

      if (!username && !primaryEmail && !primaryPhone && Object.keys(identities).length === 0) {
        const [result] = await show({
          ModalContent: t('user_details.warning_no_sign_in_identifier'),
          type: 'confirm',
        });

        if (!result) {
          return;
        }
      }

      const parseResult = safeParseJsonObject(inputCustomData);

      if (!parseResult.success) {
        toast.error(t('user_details.custom_data_invalid'));

        return;
      }

      const payload: Partial<User> = {
        ...formData,
        primaryPhone: parsePhoneNumber(primaryPhone),
        customData: parseResult.data,
      };

      const updatedUser = await api.patch(`api/users/${userId}`, { json: payload }).json<User>();
      reset(userDetailsParser.toLocalForm(updatedUser));
      onUserUpdated(updatedUser);
      toast.success(t('general.saved'));
    })
  );

  return (
    <>
      <DetailsForm
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        onSubmit={onSubmit}
        onDiscard={reset}
      >
        <FormCard
          title="user_details.authentication"
          description="user_details.authentication_description"
          learnMoreLink={{
            href: getDocumentationUrl('/docs/references/users'),
            targetBlank: 'noopener',
          }}
        >
          <FormField title="user_details.field_email">
            <TextInput
              {...register('primaryEmail', {
                pattern: { value: emailRegEx, message: t('errors.email_pattern_error') },
              })}
              error={errors.primaryEmail?.message}
              placeholder={t('users.placeholder_email')}
            />
          </FormField>
          <FormField title="user_details.field_phone">
            <TextInput
              {...register('primaryPhone', {
                validate: (value) => {
                  if (!value) {
                    return true;
                  }
                  const parsed = trySafe(() => parsePhoneNumberWithError(value));

                  return (
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    parsed?.isValid() || t('errors.phone_pattern_error')
                  );
                },
              })}
              error={errors.primaryPhone?.message}
              placeholder={t('users.placeholder_phone')}
            />
          </FormField>
          <FormField title="user_details.field_username">
            <TextInput
              {...register('username', {
                pattern: { value: usernameRegEx, message: t('errors.username_pattern_error') },
              })}
              error={errors.username?.message}
              placeholder={t('users.placeholder_username')}
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
          {isDevFeaturesEnabled && (
            <FormField title="user_details.field_sso_connectors">
              <UserSsoIdentities ssoIdentities={user.ssoIdentities ?? []} />
            </FormField>
          )}
          <FormField title="user_details.mfa.field_name">
            <UserMfaVerifications userId={user.id} />
          </FormField>
        </FormCard>
        <FormCard title="user_details.user_profile">
          <FormField title="user_details.field_name">
            <TextInput {...register('name')} placeholder={t('users.placeholder_name')} />
          </FormField>
          <FormField title="user_details.field_avatar">
            <TextInput
              {...register('avatar', {
                validate: (value) =>
                  !value || uriValidator(value) || t('errors.invalid_uri_format'),
              })}
              error={errors.avatar?.message}
              placeholder={t('user_details.field_avatar_placeholder')}
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
