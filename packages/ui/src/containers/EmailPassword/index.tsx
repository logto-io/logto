import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import ForgotPasswordLink from '@/components/ForgotPasswordLink';
import Input, { PasswordInput } from '@/components/Input';
import TermsOfUse from '@/containers/TermsOfUse';
import useForm from '@/hooks/use-form';
import usePasswordSignIn from '@/hooks/use-password-sign-in';
import { useForgotPasswordSettings } from '@/hooks/use-sie';
import useTerms from '@/hooks/use-terms';
import { emailValidation, requiredValidation } from '@/utils/field-validations';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
};

type FieldState = {
  email: string;
  password: string;
};

const defaultState: FieldState = {
  email: '',
  password: '',
};

const EmailPassword = ({ className, autoFocus }: Props) => {
  const { t } = useTranslation();
  const { termsValidation } = useTerms();
  const { errorMessage, clearErrorMessage, onSubmit } = usePasswordSignIn(SignInIdentifier.Email);
  const { isForgotPasswordEnabled, email } = useForgotPasswordSettings();

  const { fieldValue, setFieldValue, register, validateForm } = useForm(defaultState);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      clearErrorMessage();

      if (!validateForm()) {
        return;
      }

      if (!(await termsValidation())) {
        return;
      }

      void onSubmit(fieldValue.email, fieldValue.password);
    },
    [
      clearErrorMessage,
      validateForm,
      termsValidation,
      onSubmit,
      fieldValue.email,
      fieldValue.password,
    ]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Input
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        placeholder={t('input.email')}
        autoFocus={autoFocus}
        className={styles.inputField}
        {...register('email', emailValidation)}
        onClear={() => {
          setFieldValue((state) => ({ ...state, email: '' }));
        }}
      />
      <PasswordInput
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
          method={email ? SignInIdentifier.Email : SignInIdentifier.Sms}
        />
      )}

      <TermsOfUse className={styles.terms} />

      <Button title="action.sign_in" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default EmailPassword;
