import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PasswordInputField } from '@/components/InputFields';
import Button from '@/shared/components/Button';
import ErrorMessage from '@/shared/components/ErrorMessage';

import styles from './index.module.scss';
import useStepUpPasswordVerification from './use-step-up-password-verification';

type FormState = {
  password: string;
};

/**
 * The pinned-user password form: the password field of the sign-in password form and nothing
 * else. The subject is pinned server-side, so there is no identifier to show or switch, and the
 * forgot-password link is absent because the mode rejects the event switch it would start.
 */
const PasswordForm = () => {
  const { t } = useTranslation();
  const { errorMessage, clearErrorMessage, onSubmit } = useStepUpPasswordVerification();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormState>({
    reValidateMode: 'onBlur',
    defaultValues: { password: '' },
  });

  useEffect(() => {
    if (!isValid) {
      clearErrorMessage();
    }
  }, [clearErrorMessage, isValid]);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage();

      await handleSubmit(async ({ password }) => {
        await onSubmit(password);
      })(event);
    },
    [clearErrorMessage, handleSubmit, onSubmit]
  );

  return (
    <form className={styles.form} onSubmit={onSubmitHandler}>
      <PasswordInputField
        autoFocus
        className={styles.inputField}
        autoComplete="current-password"
        label={t('input.password')}
        isDanger={Boolean(errors.password)}
        errorMessage={errors.password?.message}
        {...register('password', { required: t('error.password_required') })}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <Button title="action.continue" name="submit" htmlType="submit" isLoading={isSubmitting} />

      <input hidden type="submit" />
    </form>
  );
};

export default PasswordForm;
