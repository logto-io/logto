import { RequestErrorBody } from '@logto/schemas';
import { usernameRegEx } from '@logto/shared';
import { HTTPError } from 'ky';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import useApi from '@/hooks/use-api';

import Input from '../Input';
import * as styles from './index.module.scss';

type FormData = {
  username?: string;
  password?: string;
  confirmPassword?: string;
};

type Response = {
  redirect?: string;
};

const RegisterForm = () => {
  const api = useApi({ hideErrorToast: true });
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const submitHandler = handleSubmit(async ({ username, password }) => {
    if (isSubmitting) {
      return;
    }

    try {
      const result = await api
        .post('/api/session/register/username-password', { json: { username, password, confirm } })
        .json<Response>();

      if (result.redirect) {
        window.location.replace(result.redirect);
      }
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { message, code } = await error.response.json<RequestErrorBody>();

        if (code === 'user.username_exists_register') {
          setError('username', { type: 'validate', message }, { shouldFocus: true });

          return;
        }

        toast.error(message);

        return;
      }
      throw error;
    }
  });

  return (
    <form className={styles.form}>
      <Input
        className={styles.input}
        {...register('username', {
          required: t('register.error.username_required'),
          pattern: { value: usernameRegEx, message: t('register.error.username_invalid_format') },
        })}
        placeholder={t('register.input.username')}
        error={errors.username?.message}
        showClearButton={Boolean(watch('username'))}
        onClear={() => {
          setValue('username', undefined);
        }}
      />
      <Input
        className={styles.input}
        {...register('password', {
          required: t('register.error.password_required'),
          minLength: { value: 6, message: t('register.error.password_min_length', { min: 6 }) },
        })}
        placeholder={t('register.input.password')}
        type="password"
        error={errors.password?.message}
        showClearButton={Boolean(watch('password'))}
        onClear={() => {
          setValue('password', undefined);
        }}
      />
      <Input
        className={styles.input}
        {...register('confirmPassword', {
          validate: (value) =>
            value === watch('password') || t('register.error.password_not_match'),
        })}
        placeholder={t('register.input.confirm_password')}
        type="password"
        error={errors.confirmPassword?.message}
        errorStyling={false}
        showClearButton={Boolean(watch('confirmPassword'))}
        onClear={() => {
          setValue('confirmPassword', undefined);
        }}
      />
      <Button
        className={styles.submitButton}
        icon={null}
        type="primary"
        size="large"
        title="admin_console.register.action.create"
        onClick={submitHandler}
      />
    </form>
  );
};

export default RegisterForm;
