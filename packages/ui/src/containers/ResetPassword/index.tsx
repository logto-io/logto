import classNames from 'classnames';
import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { resetPassword } from '@/apis/reset-password';
import Button from '@/components/Button';
import Input from '@/components/Input';
import useApi from '@/hooks/use-api';
import useForm from '@/hooks/use-form';
import { passwordValidation, confirmPasswordValidation } from '@/utils/field-validations';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
};

type FieldState = {
  password: string;
  confirmPassword: string;
};

const defaultState: FieldState = {
  password: '',
  confirmPassword: '',
};

const ResetPassword = ({ className, autoFocus }: Props) => {
  const { t } = useTranslation();

  const { fieldValue, setFieldValue, register, validateForm } = useForm(defaultState);

  const { result, run: asyncRegister } = useApi(resetPassword);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (!validateForm()) {
        return;
      }

      void asyncRegister(fieldValue.password);
    },
    [validateForm, asyncRegister, fieldValue]
  );

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [result]);

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Input
        className={styles.inputField}
        name="new-password"
        type="password"
        autoComplete="new-password"
        placeholder={t('input.password')}
        autoFocus={autoFocus}
        {...register('password', passwordValidation)}
        onClear={() => {
          setFieldValue((state) => ({ ...state, password: '' }));
        }}
      />
      <Input
        className={styles.inputField}
        name="confirm-new-password"
        type="password"
        placeholder={t('input.confirm_password')}
        {...register('confirmPassword', (confirmPassword) =>
          confirmPasswordValidation(fieldValue.password, confirmPassword)
        )}
        errorStyling={false}
        onClear={() => {
          setFieldValue((state) => ({ ...state, confirmPassword: '' }));
        }}
      />

      <Button title="action.confirm" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default ResetPassword;
