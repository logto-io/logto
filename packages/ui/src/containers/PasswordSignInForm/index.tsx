import type { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { PasswordInput } from '@/components/Input';
import useForm from '@/hooks/use-form';
import usePasswordSignIn from '@/hooks/use-password-sign-in';
import { requiredValidation } from '@/utils/field-validations';

import PasswordlessSignInLink from './PasswordlessSignInLink';
import * as styles from './index.module.scss';

type Props = {
  method: SignInIdentifier.Email | SignInIdentifier.Sms;
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
  const { errorMessage, clearErrorMessage, onSubmit } = usePasswordSignIn(method);

  const { fieldValue, register, validateForm } = useForm(defaultState);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      clearErrorMessage();

      if (!validateForm()) {
        return;
      }

      void onSubmit(value, fieldValue.password);
    },
    [clearErrorMessage, validateForm, onSubmit, value, fieldValue.password]
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

      {hasPasswordlessButton && (
        <PasswordlessSignInLink className={styles.switch} method={method} value={value} />
      )}

      <Button title="action.continue" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default PasswordSignInForm;
