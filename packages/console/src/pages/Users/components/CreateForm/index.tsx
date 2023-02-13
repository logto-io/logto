import { usernameRegEx } from '@logto/core-kit';
import type { User } from '@logto/schemas';
import { nanoid } from 'nanoid';
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

type FormData = {
  username: string;
  name: string;
};

type CreatedUserInfo = {
  user: User;
  password: string;
};

type Props = {
  onClose: () => void;
  onCreate: () => void;
};

const CreateForm = ({ onClose, onCreate }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { search } = useLocation();
  const navigate = useNavigate();
  const [createdUserInfo, setCreatedUserInfo] = useState<CreatedUserInfo>();

  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm<FormData>();

  const api = useApi();

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) {
      return;
    }

    const password = nanoid(8);

    const createdUser = await api.post('api/users', { json: { ...data, password } }).json<User>();

    setCreatedUserInfo({
      user: createdUser,
      password,
    });

    onCreate();
  });

  return createdUserInfo ? (
    <UserAccountInformation
      title="user_details.created_title"
      username={createdUserInfo.user.username ?? '-'}
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
          <FormField isRequired title="users.create_form_username">
            <TextInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              {...register('username', {
                required: true,
                pattern: {
                  value: usernameRegEx,
                  message: t('errors.username_pattern_error'),
                },
              })}
              hasError={Boolean(errors.username)}
              errorMessage={errors.username?.message}
            />
          </FormField>
          <FormField title="users.create_form_name">
            <TextInput
              {...register('name')}
              hasError={Boolean(errors.name)}
              errorMessage={errors.name?.message}
            />
          </FormField>
        </form>
      </ModalLayout>
    </Modal>
  );
};

export default CreateForm;
