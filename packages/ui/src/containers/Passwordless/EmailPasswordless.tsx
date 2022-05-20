import classNames from 'classnames';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { getSendPasscodeApi } from '@/apis/utils';
import Button from '@/components/Button';
import Input from '@/components/Input';
import PasswordlessConfirmModal from '@/containers/PasswordlessConfirmModal';
import TermsOfUse from '@/containers/TermsOfUse';
import useApi, { ErrorHandlers } from '@/hooks/use-api';
import useForm from '@/hooks/use-form';
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
  const [showPasswordlessConfirmModal, setShowPasswordlessConfirmModal] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const navigate = useNavigate();
  const { termsValidation } = useTerms();
  const { fieldValue, setFieldValue, setFieldErrors, register, validateForm } =
    useForm(defaultState);

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.email_not_exists': () => {
        setShowPasswordlessConfirmModal(true);
      },
      'user.email_exists_register': () => {
        setShowPasswordlessConfirmModal(true);
      },
      'guard.invalid_input': () => {
        setFieldErrors({ email: 'invalid_email' });
      },
    }),
    [setFieldErrors]
  );

  const sendPasscode = getSendPasscodeApi(type, 'email');
  const { result, run: asyncSendPasscode } = useApi(sendPasscode, errorHandlers);

  const onSubmitHandler = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    if (!(await termsValidation())) {
      return;
    }

    void asyncSendPasscode(fieldValue.email);
  }, [validateForm, termsValidation, asyncSendPasscode, fieldValue.email]);

  const onModalCloseHandler = useCallback(() => {
    setShowPasswordlessConfirmModal(false);
  }, []);

  useEffect(() => {
    if (result) {
      navigate(
        {
          pathname: `/${type}/email/passcode-validation`,
          search: location.search,
        },
        { state: { email: fieldValue.email } }
      );
    }
  }, [fieldValue.email, navigate, result, type]);

  return (
    <>
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
      <PasswordlessConfirmModal
        isOpen={showPasswordlessConfirmModal}
        type={type === 'sign-in' ? 'register' : 'sign-in'}
        method="email"
        value={fieldValue.email}
        onClose={onModalCloseHandler}
      />
    </>
  );
};

export default EmailPasswordless;
