import { emailRegEx, phoneInputRegEx, usernameRegEx } from '@logto/core-kit';
import type { CreateUser, User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import ModalLayout from '@/components/ModalLayout';
import TextInput from '@/components/TextInput';
import UserAccountInformation from '@/components/UserAccountInformation';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { parsePhoneNumber } from '@/utils/phone';

import * as styles from './index.module.scss';
import { createInitialPassword } from './utils';

type FormData = Pick<CreateUser, 'name' | 'username' | 'primaryEmail' | 'primaryPhone'>;

type CreatedUserInfo = {
  user: User;
  password: string;
};

type Props = {
  onClose: () => void;
  onCreate: () => void;
};

function CreateForm({ onClose, onCreate }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { search } = useLocation();
  const navigate = useNavigate();
  const [createdUserInfo, setCreatedUserInfo] = useState<CreatedUserInfo>();
  const [missingIdentifierError, setMissingIdentifierError] = useState<string>();

  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors, submitCount },
    getValues,
    trigger,
  } = useForm<FormData>();

  const api = useApi();

  const hasIdentifier = () => {
    const { username, primaryEmail, primaryPhone } = getValues();
    return Boolean(username) || Boolean(primaryEmail) || Boolean(primaryPhone);
  };

  const revalidateForm = () => {
    if (submitCount) {
      if (hasIdentifier()) {
        setMissingIdentifierError(undefined);
      } else {
        setMissingIdentifierError(t('users.error_missing_identifier'));
      }
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) {
      return;
    }

    setMissingIdentifierError(undefined);

    if (!hasIdentifier()) {
      setMissingIdentifierError(t('users.error_missing_identifier'));
      return;
    }

    const password = createInitialPassword();

    const { primaryPhone } = data;

    const userData = {
      ...data,
      password,
      ...conditional(primaryPhone && { primaryPhone: parsePhoneNumber(primaryPhone) }),
    };

    // Filter out empty values
    const payload = Object.fromEntries(
      Object.entries(userData).filter(([, value]) => Boolean(value))
    );

    const createdUser = await api.post('api/users', { json: payload }).json<User>();

    setCreatedUserInfo({
      user: createdUser,
      password,
    });

    onCreate();
  });

  return createdUserInfo ? (
    <UserAccountInformation
      title="user_details.created_title"
      user={createdUserInfo.user}
      password={createdUserInfo.password}
      confirmButtonTitle="users.check_user_detail"
      onClose={() => {
        navigate({ pathname: '/users', search });
      }}
      onConfirm={() => {
        navigate(`/users/${createdUserInfo.user.id}`, { replace: true });
      }}
    />
  ) : (
    <Modal
      shouldCloseOnEsc
      isOpen
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        title="users.create"
        subtitle="users.create_subtitle"
        footer={
          <Button
            disabled={isSubmitting}
            htmlType="submit"
            title="users.create"
            size="large"
            type="primary"
            onClick={onSubmit}
          />
        }
        onClose={onClose}
      >
        <form>
          <FormField title="user_details.field_email">
            <TextInput
              {...register('primaryEmail', {
                pattern: {
                  value: emailRegEx,
                  message: t('errors.email_pattern_error'),
                },
                onChange: () => {
                  revalidateForm();
                },
              })}
              error={errors.primaryEmail?.message ?? Boolean(missingIdentifierError)}
            />
          </FormField>
          <FormField title="user_details.field_phone">
            <TextInput
              {...register('primaryPhone', {
                pattern: {
                  value: phoneInputRegEx,
                  message: t('errors.phone_pattern_error'),
                },
                onChange: () => {
                  revalidateForm();
                },
              })}
              error={errors.primaryPhone?.message ?? Boolean(missingIdentifierError)}
            />
          </FormField>
          <FormField title="user_details.field_username">
            <TextInput
              {...register('username', {
                pattern: {
                  value: usernameRegEx,
                  message: t('errors.username_pattern_error'),
                },
                onChange: () => {
                  revalidateForm();
                },
              })}
              error={errors.username?.message ?? Boolean(missingIdentifierError)}
            />
          </FormField>
        </form>
        {missingIdentifierError && <div className={styles.error}>{missingIdentifierError}</div>}
      </ModalLayout>
    </Modal>
  );
}

export default CreateForm;
