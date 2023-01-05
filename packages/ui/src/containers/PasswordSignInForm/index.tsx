import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import ForgotPasswordLink from '@/components/ForgotPasswordLink';
import { PasswordInput } from '@/components/Input';
import useForm from '@/hooks/use-form';
import usePasswordSignIn from '@/hooks/use-password-sign-in';
import { useForgotPasswordSettings } from '@/hooks/use-sie';
import { requiredValidation } from '@/utils/field-validations';

import PasswordlessSignInLink from './PasswordlessSignInLink';
import * as styles from './index.module.scss';

type Props = {
  method: SignInIdentifier.Email | SignInIdentifier.Phone;
  value: string;
  hasPasswordlessButton?: boolean;
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
};

type FieldState = {
  password: string;
};

const defaultState: FieldState = {
  password: '',
};

const PasswordSignInForm = ({
  className,
  autoFocus,
  hasPasswordlessButton = false,
  method,
  value,
}: Props) => {
  const { t } = useTranslation();
  const { errorMessage, clearErrorMessage, onSubmit } = usePasswordSignIn();
  const { fieldValue, register, validateForm } = useForm(defaultState);
  const { isForgotPasswordEnabled, phone, email } = useForgotPasswordSettings();

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      clearErrorMessage();

      if (!validateForm()) {
        return;
      }

      const payload =
        method === SignInIdentifier.Email
          ? { email: value, password: fieldValue.password }
          : { phone: value, password: fieldValue.password };

      void onSubmit(payload);
    },
    [clearErrorMessage, validateForm, onSubmit, method, value, fieldValue.password]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <PasswordInput
        autoFocus={autoFocus}
        className={styles.inputField}
        name="password"
        autoComplete="current-password"
        placeholder={t('input.password')}
        {...register('password', (value) => requiredValidation('password', value))}
      />
      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      {isForgotPasswordEnabled && (
        <ForgotPasswordLink
          className={styles.link}
          method={
            method === SignInIdentifier.Email
              ? email
                ? SignInIdentifier.Email
                : SignInIdentifier.Phone
              : phone
              ? SignInIdentifier.Phone
              : SignInIdentifier.Email
          }
        />
      )}

      {hasPasswordlessButton && (
        <PasswordlessSignInLink className={styles.switch} method={method} value={value} />
      )}

      <Button title="action.continue" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default PasswordSignInForm;
