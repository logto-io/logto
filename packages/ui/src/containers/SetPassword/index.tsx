import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ClearIcon from '@/assets/icons/clear-icon.svg';
import Button from '@/components/Button';
import IconButton from '@/components/Button/IconButton';
import ErrorMessage from '@/components/ErrorMessage';
import InputField from '@/components/InputField';
import { passwordErrorWatcher } from '@/utils/form';

import TogglePassword from './TogglePassword';
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
  ['new-password']: string;
  ['confirm-password']: string;
};

const SetPassword = ({
  className,
  autoFocus,
  onSubmit,
  errorMessage,
  clearErrorMessage,
}: Props) => {
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    watch,
    resetField,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldState>({
    reValidateMode: 'onChange',
    defaultValues: { 'new-password': '', 'confirm-password': '' },
  });

  const onSubmitHandler = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage?.();

      void handleSubmit((data, event) => {
        onSubmit(data['new-password']);
        event?.preventDefault();
      })(event);
    },
    [clearErrorMessage, handleSubmit, onSubmit]
  );

  const newPasswordError = passwordErrorWatcher(errors['new-password']);

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <InputField
        required
        className={styles.inputField}
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder={t('input.password')}
        autoFocus={autoFocus}
        isDanger={!!newPasswordError}
        error={newPasswordError}
        aria-invalid={!!newPasswordError}
        {...register('new-password', { required: true, minLength: 6 })}
        isSuffixFocusVisible={!!watch('new-password')}
        suffix={
          <IconButton
            onClick={() => {
              resetField('new-password');
            }}
          >
            <ClearIcon />
          </IconButton>
        }
      />

      <InputField
        required
        className={styles.inputField}
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder={t('input.confirm_password')}
        error={errors['confirm-password'] && 'passwords_do_not_match'}
        aria-invalid={!!errors['confirm-password']}
        {...register('confirm-password', {
          validate: (value) => value === watch('new-password'),
        })}
        isSuffixFocusVisible={!!watch('confirm-password')}
        suffix={
          <IconButton
            onClick={() => {
              resetField('confirm-password');
            }}
          >
            <ClearIcon />
          </IconButton>
        }
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <TogglePassword isChecked={showPassword} onChange={setShowPassword} />

      <Button
        title="action.save_password"
        onClick={async () => {
          onSubmitHandler();
        }}
      />

      <input hidden type="submit" />
    </form>
  );
};

export default SetPassword;
