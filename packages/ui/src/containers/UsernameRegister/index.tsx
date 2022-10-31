import classNames from 'classnames';
import { useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { verifyUsernameExistence } from '@/apis/register';
import Button from '@/components/Button';
import Input from '@/components/Input';
import TermsOfUse from '@/containers/TermsOfUse';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useForm from '@/hooks/use-form';
import useTerms from '@/hooks/use-terms';
import { usernameValidation } from '@/utils/field-validations';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
};

type FieldState = {
  username: string;
};

const defaultState: FieldState = {
  username: '',
};

const UsernameRegister = ({ className }: Props) => {
  const { t } = useTranslation();
  const { termsValidation } = useTerms();
  const navigate = useNavigate();

  const {
    fieldValue,
    setFieldValue,
    setFieldErrors,
    register: fieldRegister,
    validateForm,
  } = useForm(defaultState);

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.username_exists_register': () => {
        setFieldErrors((state) => ({
          ...state,
          username: 'username_exists',
        }));
      },
    }),
    [setFieldErrors]
  );

  const { result, run: asyncVerifyUsername } = useApi(verifyUsernameExistence, errorHandlers);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (!validateForm()) {
        return;
      }

      if (!(await termsValidation())) {
        return;
      }

      void asyncVerifyUsername(fieldValue.username);
    },
    [validateForm, termsValidation, asyncVerifyUsername, fieldValue]
  );

  useEffect(() => {
    if (result) {
      navigate('/register/password');
    }
  }, [navigate, result]);

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <div className={styles.formFields}>
        <Input
          className={styles.inputField}
          name="new-username"
          placeholder={t('input.username')}
          {...fieldRegister('username', usernameValidation)}
          onClear={() => {
            setFieldValue((state) => ({ ...state, username: '' }));
          }}
        />
      </div>

      <TermsOfUse className={styles.terms} />

      <Button title="action.create" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default UsernameRegister;
