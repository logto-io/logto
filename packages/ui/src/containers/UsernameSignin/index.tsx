/**
 * TODO:
 * 1. API redesign handle api error and loading status globally in PageContext
 */

import classNames from 'classnames';
import React, { useCallback, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { signInBasic } from '@/apis/sign-in';
import Button from '@/components/Button';
import Input from '@/components/Input';
import PasswordInput from '@/components/Input/PasswordInput';
import TermsOfUse from '@/containers/TermsOfUse';
import useApi from '@/hooks/use-api';
import useForm from '@/hooks/use-form';
import { PageContext } from '@/hooks/use-page-context';
import useTerms from '@/hooks/use-terms';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';
import { usernameValidation, passwordValidation } from '@/utils/field-validations';

import * as styles from './index.module.scss';

type FieldState = {
  username: string;
  password: string;
};

type Props = {
  className?: string;
};

const defaultState: FieldState = {
  username: '',
  password: '',
};

const UsernameSignin = ({ className }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { setToast } = useContext(PageContext);
  const { error, result, run: asyncSignInBasic } = useApi(signInBasic);
  const { termsValidation } = useTerms();
  const { fieldValue, setFieldValue, register, validateForm } = useForm(defaultState);

  const onSubmitHandler = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    if (!termsValidation()) {
      return;
    }

    const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

    void asyncSignInBasic(fieldValue.username, fieldValue.password, socialToBind);
  }, [validateForm, termsValidation, asyncSignInBasic, fieldValue]);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.assign(result.redirectTo);
    }
  }, [result]);

  useEffect(() => {
    // TODO: API error message
    if (error) {
      setToast(t('error.request', { ...error }));
    }
  }, [error, t, setToast]);

  return (
    <form className={classNames(styles.form, className)}>
      <Input
        className={styles.inputField}
        name="username"
        autoComplete="username"
        placeholder={t('input.username')}
        {...register('username', usernameValidation)}
        onClear={() => {
          setFieldValue((state) => ({ ...state, username: '' }));
        }}
      />
      <PasswordInput
        className={styles.inputField}
        name="password"
        autoComplete="current-password"
        placeholder={t('input.password')}
        {...register('password', passwordValidation)}
      />

      <TermsOfUse className={styles.terms} />

      <Button onClick={onSubmitHandler}>{t('action.sign_in')}</Button>
    </form>
  );
};

export default UsernameSignin;
