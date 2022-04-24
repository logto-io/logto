/**
 * TODO:
 * 1. API redesign handle api error and loading status globally in PageContext
 */

import classNames from 'classnames';
import React, { useEffect, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { register } from '@/apis/register';
import Button from '@/components/Button';
import Input from '@/components/Input';
import PasswordInput from '@/components/Input/PasswordInput';
import TermsOfUse from '@/containers/TermsOfUse';
import useApi from '@/hooks/use-api';
import useForm from '@/hooks/use-form';
import { PageContext } from '@/hooks/use-page-context';
import useTerms from '@/hooks/use-terms';
import {
  usernameValidation,
  passwordValidation,
  confirmPasswordValidation,
} from '@/utils/field-validations';

import * as styles from './index.module.scss';

type FieldState = {
  username: string;
  password: string;
  confirmPassword: string;
};

type Props = {
  className?: string;
};

const defaultState: FieldState = {
  username: '',
  password: '',
  confirmPassword: '',
};

const CreateAccount = ({ className }: Props) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { termsValidation } = useTerms();
  const { setToast } = useContext(PageContext);
  const { error, result, run: asyncRegister } = useApi(register);
  const {
    fieldValue,
    setFieldValue,
    register: fieldRegister,
    formValidation,
  } = useForm(defaultState);

  const onSubmitHandler = useCallback(() => {
    if (!formValidation()) {
      return;
    }

    if (!termsValidation()) {
      return;
    }

    void asyncRegister(fieldValue.username, fieldValue.password);
  }, [formValidation, termsValidation, asyncRegister, fieldValue]);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.assign(result.redirectTo);
    }
  }, [result]);

  useEffect(() => {
    // TODO: username exist error message
    if (error) {
      setToast(error.message);
    }
  }, [error, i18n, setToast, t]);

  return (
    <form className={classNames(styles.form, className)}>
      <Input
        className={styles.inputField}
        name="username"
        autoComplete="username"
        placeholder={t('input.username')}
        {...fieldRegister('username', usernameValidation)}
        onClear={() => {
          setFieldValue((state) => ({ ...state, username: '' }));
        }}
      />
      <PasswordInput
        forceHidden
        className={styles.inputField}
        name="password"
        autoComplete="current-password"
        placeholder={t('input.password')}
        {...fieldRegister('password', passwordValidation)}
      />
      <PasswordInput
        forceHidden
        className={styles.inputField}
        name="confirm_password"
        autoComplete="current-password"
        placeholder={t('input.confirm_password')}
        {...fieldRegister('confirmPassword', (confirmPassword) =>
          confirmPasswordValidation(fieldValue.password, confirmPassword)
        )}
      />
      <TermsOfUse className={styles.terms} />

      <Button onClick={onSubmitHandler}>{t('action.create')}</Button>
    </form>
  );
};

export default CreateAccount;
