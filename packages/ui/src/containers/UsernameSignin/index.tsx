/**
 * TODO:
 * 1. API redesign handle api error and loading status globally in PageContext
 * 2. Input field validation, should move the validation rule to the input field scope
 * 4. Read terms of use settings from SignInExperience Settings
 */

import classNames from 'classnames';
import React, { useState, useCallback, useEffect, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { signInBasic } from '@/apis/sign-in';
import Button from '@/components/Button';
import { ErrorType } from '@/components/ErrorMessage';
import Input from '@/components/Input';
import PasswordInput from '@/components/Input/PasswordInput';
import TermsOfUse from '@/components/TermsOfUse';
import useApi from '@/hooks/use-api';
import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';

type FieldState = {
  username: string;
  password: string;
  termsAgreement: boolean;
};

type ErrorState = {
  [key in keyof FieldState]?: ErrorType;
};

type FieldValidations = {
  [key in keyof FieldState]?: (state: FieldState) => ErrorType | undefined;
};

type Props = {
  className?: string;
};

const defaultState: FieldState = {
  username: '',
  password: '',
  termsAgreement: false,
};

const UsernameSignin = ({ className }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const [fieldState, setFieldState] = useState<FieldState>(defaultState);
  const [fieldErrors, setFieldErrors] = useState<ErrorState>({});

  const { setToast } = useContext(PageContext);

  const { error, result, run: asyncSignInBasic } = useApi(signInBasic);

  const validations = useMemo<FieldValidations>(
    () => ({
      username: ({ username }) => {
        if (!username) {
          return { code: 'required', data: { field: t('input.username') } };
        }
      },
      password: ({ password }) => {
        if (!password) {
          return { code: 'required', data: { field: t('input.password') } };
        }
      },
      termsAgreement: ({ termsAgreement }) => {
        if (!termsAgreement) {
          return 'agree_terms_required';
        }
      },
    }),
    [t]
  );

  const onSubmitHandler = useCallback(async () => {
    // Validates
    const usernameError = validations.username?.(fieldState);
    const passwordError = validations.password?.(fieldState);

    if (usernameError || passwordError) {
      setFieldErrors((previous) => ({
        ...previous,
        username: usernameError,
        password: passwordError,
      }));

      return;
    }

    const termsAgreementError = validations.termsAgreement?.(fieldState);

    if (termsAgreementError) {
      setFieldErrors((previous) => ({
        ...previous,
        termsAgreement: termsAgreementError,
      }));

      return;
    }

    void asyncSignInBasic(fieldState.username, fieldState.password);
  }, [validations, fieldState, asyncSignInBasic]);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.assign(result.redirectTo);
    }
  }, [result]);

  useEffect(() => {
    // Clear errors
    for (const key of Object.keys(fieldState) as [keyof FieldState]) {
      if (fieldState[key]) {
        setFieldErrors((previous) => {
          if (!previous[key]) {
            return previous;
          }

          return { ...previous, [key]: undefined };
        });
      }
    }
  }, [fieldState]);

  useEffect(() => {
    // TODO: username password not correct error message
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
        className={styles.inputField}
        name="password"
        autoComplete="current-password"
        placeholder={t('input.password')}
        value={fieldState.password}
        error={fieldErrors.password}
        onChange={({ target }) => {
          if (target instanceof HTMLInputElement) {
            const { value } = target;
            setFieldState((state) => ({ ...state, password: value }));
          }
        }}
      />

      <TermsOfUse
        name="termsAgreement"
        className={styles.terms}
        termsUrl="/"
        isChecked={fieldState.termsAgreement}
        onChange={(checked) => {
          setFieldState((state) => ({ ...state, termsAgreement: checked }));
        }}
      />

      <Button onClick={onSubmitHandler}>{t('action.sign_in')}</Button>
    </form>
  );
};

export default UsernameSignin;
