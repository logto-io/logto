import classNames from 'classnames';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import Input from '@/components/Input';
import useForm from '@/hooks/use-form';
import { passwordValidation, confirmPasswordValidation } from '@/utils/field-validations';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  onSubmit: (password: string) => void;
  errorMessage?: string;
  clearErrorMessage?: () => void;
};

type FieldState = {
  password: string;
  confirmPassword: string;
};

const defaultState: FieldState = {
  password: '',
  confirmPassword: '',
};

const SetPassword = ({
  className,
  autoFocus,
  onSubmit,
  errorMessage,
  clearErrorMessage,
}: Props) => {
  const { t } = useTranslation();
  const { fieldValue, setFieldValue, register, validateForm } = useForm(defaultState);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      clearErrorMessage?.();

      if (!validateForm()) {
        return;
      }

      onSubmit(fieldValue.password);
    },
    [clearErrorMessage, validateForm, onSubmit, fieldValue.password]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Input
        className={styles.inputField}
        name="new-password"
        type="password"
        autoComplete="new-password"
        placeholder={t('input.password')}
        // eslint-disable-next-line jsx-a11y/no-autofocus
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
        isErrorStyling={false}
        onClear={() => {
          setFieldValue((state) => ({ ...state, confirmPassword: '' }));
        }}
      />
      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <Button title="action.save_password" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default SetPassword;
