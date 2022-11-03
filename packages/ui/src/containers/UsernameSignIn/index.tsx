import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { signInWithUsername } from '@/apis/sign-in';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import Input, { PasswordInput } from '@/components/Input';
import TermsOfUse from '@/containers/TermsOfUse';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useForm from '@/hooks/use-form';
import useTerms from '@/hooks/use-terms';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';
import { requiredValidation } from '@/utils/field-validations';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
};

type FieldState = {
  username: string;
  password: string;
};

const defaultState: FieldState = {
  username: '',
  password: '',
};

const UsernameSignIn = ({ className, autoFocus }: Props) => {
  const { t } = useTranslation();
  const { termsValidation } = useTerms();
  const [errorMessage, setErrorMessage] = useState<string>();

  const { fieldValue, setFieldValue, register, validateForm } = useForm(defaultState);

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.invalid_credentials': (error) => {
        setErrorMessage(error.message);
      },
    }),
    [setErrorMessage]
  );

  const { result, run: asyncSignInWithUsername } = useApi(signInWithUsername, errorHandlers);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      setErrorMessage(undefined);

      if (!validateForm()) {
        return;
      }

      if (!(await termsValidation())) {
        return;
      }

      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

      void asyncSignInWithUsername(fieldValue.username, fieldValue.password, socialToBind);
    },
    [
      validateForm,
      termsValidation,
      asyncSignInWithUsername,
      fieldValue.username,
      fieldValue.password,
    ]
  );

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [result]);

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        className={styles.inputField}
        name="username"
        autoComplete="username"
        placeholder={t('input.username')}
        {...register('username', (value) => requiredValidation('username', value))}
        onClear={() => {
          setFieldValue((state) => ({ ...state, username: '' }));
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

      <TermsOfUse className={styles.terms} />

      <Button title="action.sign_in" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default UsernameSignIn;
