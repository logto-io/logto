import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { PasswordInputField } from '@/components/InputFields';
import ForgotPasswordLink from '@/containers/ForgotPasswordLink';
import usePasswordSignIn from '@/hooks/use-password-sign-in';
import { useForgotPasswordSettings } from '@/hooks/use-sie';

import * as styles from '../index.module.scss';

import VerificationCodeLink from './VerificationCodeLink';

type Props = {
  className?: string;
  identifier: SignInIdentifier;
  value: string;
  isVerificationCodeEnabled?: boolean;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
};

type FormState = {
  password: string;
};

const PasswordForm = ({
  className,
  autoFocus,
  isVerificationCodeEnabled = false,
  identifier,
  value,
}: Props) => {
  const { t } = useTranslation();
  const { errorMessage, clearErrorMessage, onSubmit } = usePasswordSignIn();
  const { isForgotPasswordEnabled } = useForgotPasswordSettings();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
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

      void handleSubmit(async ({ password }, event) => {
        event?.preventDefault();

        await onSubmit({
          [identifier]: value,
          password,
        });
      })(event);
    },
    [clearErrorMessage, handleSubmit, onSubmit, identifier, value]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <PasswordInputField
        autoFocus={autoFocus}
        className={styles.inputField}
        autoComplete="current-password"
        placeholder={t('input.password')}
        isDanger={!!errors.password}
        errorMessage={errors.password?.message}
        {...register('password', { required: t('error.password_required') })}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      {isForgotPasswordEnabled && (
        <ForgotPasswordLink className={styles.link} identifier={identifier} value={value} />
      )}

      <Button title="action.continue" name="submit" htmlType="submit" />

      {identifier !== SignInIdentifier.Username && isVerificationCodeEnabled && (
        <VerificationCodeLink className={styles.switch} identifier={identifier} value={value} />
      )}

      <input hidden type="submit" />
    </form>
  );
};

export default PasswordForm;
