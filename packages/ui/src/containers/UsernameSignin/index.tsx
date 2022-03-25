/**
 * TODO:
 * 1. API redesign handle api error and loading status globally in PageContext
 * 2. Input field validation, should move the validation rule to the input field scope
 * 3. Forgot password URL
 * 4. read terms of use settings from SignInExperience Settings
 */

import { LogtoErrorI18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { FC, useState, useCallback, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { signInBasic } from '@/apis/sign-in';
import Button from '@/components/Button';
import { ErrorType } from '@/components/ErrorMessage';
import Input from '@/components/Input';
import PasswordInput from '@/components/Input/PasswordInput';
import TermsOfUse from '@/components/TermsOfUse';
import TextLink from '@/components/TextLink';
import PageContext from '@/hooks/page-context';
import useApi from '@/hooks/use-api';

import * as styles from './index.module.scss';

type FieldState = {
  username: string;
  password: string;
  termsAgreement: boolean;
};

type ErrorState = {
  [key in keyof FieldState]?: ErrorType;
};

const defaultState: FieldState = {
  username: '',
  password: '',
  termsAgreement: false,
};

const UsernameSignin: FC = () => {
  const { t, i18n } = useTranslation();
  const [fieldState, setFieldState] = useState<FieldState>(defaultState);
  const [fieldErrors, setFieldErrors] = useState<ErrorState>({});

  const { setToast } = useContext(PageContext);

  const { error, loading, result, run: asyncSignInBasic } = useApi(signInBasic);

  const onSubmitHandler = useCallback(async () => {
    // Should be removed after api redesign
    if (loading) {
      return;
    }

    if (!fieldState.username) {
      setFieldErrors((previous) => ({
        ...previous,
        username: { code: 'form.required', data: { fieldName: t('sign_in.username') } },
      }));
    }

    if (!fieldState.password) {
      setFieldErrors((previous) => ({
        ...previous,
        password: { code: 'form.required', data: { fieldName: t('sign_in.password') } },
      }));
    }

    if (!fieldState.username || !fieldState.password) {
      return;
    }

    if (!fieldState.termsAgreement) {
      setFieldErrors((previous) => ({
        ...previous,
        termsAgreement: 'form.terms_required',
      }));

      return;
    }

    void asyncSignInBasic(fieldState.username, fieldState.password);
  }, [asyncSignInBasic, loading, t, fieldState]);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.assign(result.redirectTo);
    }
  }, [result]);

  useEffect(() => {
    // Clear errors
    for (const key of Object.keys(fieldState) as [keyof FieldState]) {
      if (fieldState[key] && fieldErrors[key]) {
        setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
      }
    }
  }, [fieldErrors, fieldState]);

  useEffect(() => {
    if (error) {
      setToast(i18n.t<string, LogtoErrorI18nKey>(`errors:${error.code}`));
    }
  }, [error, i18n, setToast]);

  return (
    <form className={styles.form}>
      <Input
        className={classNames(styles.inputField, fieldErrors.username && styles.withError)}
        name="username"
        autoComplete="username"
        placeholder={t('sign_in.username')}
        value={fieldState.username}
        error={fieldErrors.username}
        onChange={({ target }) => {
          if (target instanceof HTMLInputElement) {
            const { value } = target;
            setFieldState((state) => ({ ...state, username: value }));
          }
        }}
        onClear={() => {
          setFieldState((state) => ({ ...state, username: '' }));
        }}
      />
      <PasswordInput
        className={classNames(styles.inputField, fieldErrors.password && styles.withError)}
        name="password"
        autoComplete="current-password"
        placeholder={t('sign_in.password')}
        value={fieldState.password}
        error={fieldErrors.password}
        onChange={({ target }) => {
          if (target instanceof HTMLInputElement) {
            const { value } = target;
            setFieldState((state) => ({ ...state, password: value }));
          }
        }}
      />
      <TextLink
        className={styles.textLink}
        type="secondary"
        text="sign_in.forgot_password"
        href="/passcode"
      />

      <TermsOfUse
        name="termsAgreement"
        className={classNames(styles.terms, fieldErrors.termsAgreement && styles.withError)}
        termsOfUse={{ enabled: true, contentUrl: '/' }}
        isChecked={fieldState.termsAgreement}
        error={fieldErrors.termsAgreement}
        onChange={(checked) => {
          setFieldState((state) => ({ ...state, termsAgreement: checked }));
        }}
      />

      <Button onClick={onSubmitHandler}>{t('sign_in.action')}</Button>
    </form>
  );
};

export default UsernameSignin;
