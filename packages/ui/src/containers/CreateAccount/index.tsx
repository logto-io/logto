import classNames from 'classnames';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { registerWithUsernamePassword } from '@/apis/interaction';
import Button from '@/components/Button';
import Input from '@/components/Input';
import TermsOfUse from '@/containers/TermsOfUse';
import useApi from '@/hooks/use-api';
import type { ErrorHandlers } from '@/hooks/use-error-handler';
import useErrorHandler from '@/hooks/use-error-handler';
import useForm from '@/hooks/use-form';
import useTerms from '@/hooks/use-terms';
import {
  validateUsername,
  passwordValidation,
  confirmPasswordValidation,
} from '@/utils/field-validations';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
};

type FieldState = {
  username: string;
  password: string;
  confirmPassword: string;
};

const defaultState: FieldState = {
  username: '',
  password: '',
  confirmPassword: '',
};

const CreateAccount = ({ className, autoFocus }: Props) => {
  const { t } = useTranslation();
  const { termsValidation } = useTerms();
  const {
    fieldValue,
    setFieldValue,
    setFieldErrors,
    register: fieldRegister,
    validateForm,
  } = useForm(defaultState);

  const asyncRegister = useApi(registerWithUsernamePassword);
  const handleError = useErrorHandler();

  const registerErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.username_already_in_use': () => {
        setFieldErrors((state) => ({
          ...state,
          username: 'username_exists',
        }));
      },
    }),
    [setFieldErrors]
  );

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (!validateForm()) {
        return;
      }

      if (!(await termsValidation())) {
        return;
      }

      const [error, result] = await asyncRegister(fieldValue.username, fieldValue.password);

      if (error) {
        await handleError(error, registerErrorHandlers);

        return;
      }

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [validateForm, termsValidation, asyncRegister, fieldValue, handleError, registerErrorHandlers]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Input
        autoFocus={autoFocus}
        className={styles.inputField}
        name="new-username"
        placeholder={t('input.username')}
        {...fieldRegister('username', validateUsername)}
        onClear={() => {
          setFieldValue((state) => ({ ...state, username: '' }));
        }}
      />
      <Input
        className={styles.inputField}
        name="new-password"
        type="password"
        autoComplete="new-password"
        placeholder={t('input.password')}
        {...fieldRegister('password', passwordValidation)}
        onClear={() => {
          setFieldValue((state) => ({ ...state, password: '' }));
        }}
      />
      <Input
        className={styles.inputField}
        name="confirm-new-password"
        type="password"
        autoComplete="new-password"
        placeholder={t('input.confirm_password')}
        {...fieldRegister('confirmPassword', (confirmPassword) =>
          confirmPasswordValidation(fieldValue.password, confirmPassword)
        )}
        isErrorStyling={false}
        onClear={() => {
          setFieldValue((state) => ({ ...state, confirmPassword: '' }));
        }}
      />

      <TermsOfUse className={styles.terms} />

      <Button title="action.create_account" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default CreateAccount;
