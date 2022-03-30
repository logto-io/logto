/**
 * TODO:
 * 1. API redesign handle api error and loading status globally in PageContext
 * 2. Input field validation, should move the validation rule to the input field scope
 * 4. Read terms of use settings from SignInExperience Settings
 */
import { LogtoErrorI18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { useState, useCallback, useMemo, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { sendEmailPasscode as sendRegisterEmailPasscode } from '@/apis/register';
import { sendEmailPasscode as sendSignInEmailPasscode } from '@/apis/sign-in';
import Button from '@/components/Button';
import { ErrorType } from '@/components/ErrorMessage';
import Input from '@/components/Input';
import TermsOfUse from '@/components/TermsOfUse';
import PageContext from '@/hooks/page-context';
import useApi from '@/hooks/use-api';

import * as styles from './index.module.scss';

type Props = {
  type: 'sign-in' | 'register';
};

type FieldState = {
  email: string;
  termsAgreement: boolean;
};

type ErrorState = {
  [key in keyof FieldState]?: ErrorType;
};

type FieldValidations = {
  [key in keyof FieldState]: (state: FieldState) => ErrorType | undefined;
};

const defaultState: FieldState = { email: '', termsAgreement: false };

const emailRegEx = /^\S+@\S+\.\S+$/;

const EmailPasswordless = ({ type }: Props) => {
  const { t, i18n } = useTranslation();
  const [fieldState, setFieldState] = useState<FieldState>(defaultState);
  const [fieldErrors, setFieldErrors] = useState<ErrorState>({});
  const { setToast } = useContext(PageContext);

  const sendPasscode = type === 'sign-in' ? sendSignInEmailPasscode : sendRegisterEmailPasscode;

  const { loading, error, result, run: asyncSendPasscode } = useApi(sendPasscode);

  const validations = useMemo<FieldValidations>(
    () => ({
      email: ({ email }) => {
        if (!emailRegEx.test(email)) {
          return 'user.invalid_email';
        }
      },
      termsAgreement: ({ termsAgreement }) => {
        if (!termsAgreement) {
          return 'form.terms_required';
        }
      },
    }),
    []
  );

  const onSubmitHandler = useCallback(() => {
    // Should be removed after api redesign
    if (loading) {
      return;
    }

    const emailError = validations.email(fieldState);

    if (emailError) {
      setFieldErrors((previous) => ({ ...previous, email: emailError }));

      return;
    }

    const termsAgreementError = validations.termsAgreement(fieldState);

    if (termsAgreementError) {
      setFieldErrors((previous) => ({ ...previous, termsAgreement: termsAgreementError }));

      return;
    }

    void asyncSendPasscode(fieldState.email);
  }, [loading, validations, fieldState, asyncSendPasscode]);

  useEffect(() => {
    // TODO: navigate to the passcode page
    console.log(result);
  }, [result]);

  useEffect(() => {
    // Clear errors
    for (const key of Object.keys(fieldState) as [keyof FieldState]) {
      if (fieldState[key]) {
        setFieldErrors((previous) => {
          if (!previous[key]) {
            return previous;
          }

          return { ...previous, [key]: validations[key](fieldState) };
        });
      }
    }
  }, [fieldState, validations]);

  useEffect(() => {
    if (error) {
      setToast(i18n.t<string, LogtoErrorI18nKey>(`errors:${error.code}`));
    }
  }, [error, i18n, setToast]);

  return (
    <form className={styles.form}>
      <Input
        className={classNames(styles.inputField, fieldErrors.email && styles.withError)}
        name="email"
        autoComplete="email"
        placeholder={t('sign_in.email')}
        value={fieldState.email}
        error={fieldErrors.email}
        onChange={({ target }) => {
          if (target instanceof HTMLInputElement) {
            const { value } = target;
            setFieldState((state) => ({ ...state, email: value }));
          }
        }}
        onClear={() => {
          setFieldState((state) => ({ ...state, email: '' }));
        }}
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

      <Button onClick={onSubmitHandler}>{t('general.continue')}</Button>
    </form>
  );
};

export default EmailPasswordless;
