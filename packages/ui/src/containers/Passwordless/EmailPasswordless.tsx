/**
 * TODO:
 * 1. API redesign handle api error and loading status globally in PageContext
 */
import classNames from 'classnames';
import React, { useCallback, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { getSendPasscodeApi } from '@/apis/utils';
import Button from '@/components/Button';
import Input from '@/components/Input';
import TermsOfUse from '@/containers/TermsOfUse';
import useApi from '@/hooks/use-api';
import useForm from '@/hooks/use-form';
import { PageContext } from '@/hooks/use-page-context';
import useTerms from '@/hooks/use-terms';
import { UserFlow } from '@/types';
import { emailValidation } from '@/utils/field-validations';

import * as styles from './index.module.scss';

type Props = {
  type: UserFlow;
  className?: string;
};

type FieldState = {
  email: string;
};

const defaultState: FieldState = { email: '' };

const EmailPasswordless = ({ type, className }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { setToast } = useContext(PageContext);
  const navigate = useNavigate();
  const { termsValidation } = useTerms();
  const { fieldValue, setFieldValue, register, formValidation } = useForm(defaultState);

  const sendPasscode = getSendPasscodeApi(type, 'email');
  const { error, result, run: asyncSendPasscode } = useApi(sendPasscode);

  const onSubmitHandler = useCallback(() => {
    if (!formValidation()) {
      return;
    }

    if (!termsValidation()) {
      return;
    }

    void asyncSendPasscode(fieldValue.email);
  }, [formValidation, termsValidation, asyncSendPasscode, fieldValue.email]);

  useEffect(() => {
    if (result) {
      navigate(`/${type}/email/passcode-validation`, { state: { email: fieldValue.email } });
    }
  }, [fieldValue.email, navigate, result, type]);

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
        {...register('email', emailValidation)}
        onClear={() => {
          setFieldValue((state) => ({ ...state, email: '' }));
        }}
      />

      <TermsOfUse className={styles.terms} />

      <Button onClick={onSubmitHandler}>{t('action.continue')}</Button>
    </form>
  );
};

export default EmailPasswordless;
