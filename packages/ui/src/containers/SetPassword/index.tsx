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
  newPassword: string;
  confirmPassword: string;
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
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmitHandler = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage?.();

      void handleSubmit((data, event) => {
        onSubmit(data.newPassword);
        event?.preventDefault();
      })(event);
    },
    [clearErrorMessage, handleSubmit, onSubmit]
  );

  const newPasswordError = passwordErrorWatcher(errors.newPassword);

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
        {...register('newPassword', { required: true, minLength: 6 })}
        isSuffixFocusVisible={!!watch('newPassword')}
        suffix={
          <IconButton
            onClick={() => {
              resetField('newPassword');
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
        error={errors.confirmPassword && 'passwords_do_not_match'}
        aria-invalid={!!errors.confirmPassword}
        {...register('confirmPassword', {
          validate: (value) => value === watch('newPassword'),
        })}
        isSuffixFocusVisible={!!watch('confirmPassword')}
        suffix={
          <IconButton
            onClick={() => {
              resetField('confirmPassword');
            }}
          >
            <ClearIcon />
          </IconButton>
        }
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <TogglePassword isChecked={showPassword} onChange={setShowPassword} />

      <Button
        name="submit"
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
