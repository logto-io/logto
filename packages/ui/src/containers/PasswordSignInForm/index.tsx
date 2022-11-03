import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { signInWithEmailPassword, signInWithPhonePassword } from '@/apis/sign-in';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { PasswordInput } from '@/components/Input';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useForm from '@/hooks/use-form';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';
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
  const [errorMessage, setErrorMessage] = useState<string>();
  const { fieldValue, register, validateForm } = useForm(defaultState);

  const api = method === SignInIdentifier.Email ? signInWithEmailPassword : signInWithPhonePassword;

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.invalid_credentials': (error) => {
        setErrorMessage(error.message);
      },
    }),
    [setErrorMessage]
  );

  const { result, run: asyncSignIn } = useApi(api, errorHandlers);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      setErrorMessage(undefined);

      if (!validateForm()) {
        return;
      }

      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

      void asyncSignIn(value, fieldValue.password, socialToBind);
    },
    [validateForm, asyncSignIn, value, fieldValue.password]
  );

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [result]);

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
