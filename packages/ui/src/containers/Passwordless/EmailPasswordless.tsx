/**
 * TODO:
 * 1. API redesign handle api error and loading status globally in PageContext
 * 2. Input field validation, should move the validation rule to the input field scope
 */
import classNames from 'classnames';
import React, { useState, useCallback, useMemo, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { getSendPasscodeApi } from '@/apis/utils';
import Button from '@/components/Button';
import { ErrorType } from '@/components/ErrorMessage';
import Input from '@/components/Input';
import TermsOfUse from '@/containers/TermsOfUse';
import useApi from '@/hooks/use-api';
import { PageContext } from '@/hooks/use-page-context';
import useTerms from '@/hooks/use-terms';
import { UserFlow } from '@/types';

import * as styles from './index.module.scss';

type Props = {
  type: UserFlow;
  className?: string;
};

type FieldState = {
  email: string;
};

type ErrorState = {
  [key in keyof FieldState]?: ErrorType;
};

type FieldValidations = {
  [key in keyof FieldState]: (state: FieldState) => ErrorType | undefined;
};

const defaultState: FieldState = { email: '' };

const emailRegEx = /^\S+@\S+\.\S+$/;

const EmailPasswordless = ({ type, className }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const [fieldState, setFieldState] = useState<FieldState>(defaultState);
  const [fieldErrors, setFieldErrors] = useState<ErrorState>({});
  const { setToast } = useContext(PageContext);
  const navigate = useNavigate();
  const { termsValidation } = useTerms();

  const sendPasscode = getSendPasscodeApi(type, 'email');

  const { error, result, run: asyncSendPasscode } = useApi(sendPasscode);

  const validations = useMemo<FieldValidations>(
    () => ({
      email: ({ email }) => {
        if (!emailRegEx.test(email)) {
          return 'invalid_email';
        }
      },
    }),
    []
  );

  const onSubmitHandler = useCallback(() => {
    const emailError = validations.email(fieldState);

    if (emailError) {
      setFieldErrors((previous) => ({ ...previous, email: emailError }));

      return;
    }

    if (!termsValidation()) {
      return;
    }

    void asyncSendPasscode(fieldState.email);
  }, [validations, fieldState, termsValidation, asyncSendPasscode]);

  useEffect(() => {
    if (result) {
      navigate(`/${type}/email/passcode-validation`, { state: { email: fieldState.email } });
    }
  }, [fieldState.email, navigate, result, type]);

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
    // TODO: request error
    if (error) {
      setToast(t('error.request', { ...error }));
    }
  }, [error, t, setToast]);

  return (
    <form className={classNames(styles.form, className)}>
      <Input
        className={styles.inputField}
        name="email"
        autoComplete="email"
        placeholder={t('input.email')}
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

      <TermsOfUse className={styles.terms} />

      <Button onClick={onSubmitHandler}>{t('action.continue')}</Button>
    </form>
  );
};

export default EmailPasswordless;
