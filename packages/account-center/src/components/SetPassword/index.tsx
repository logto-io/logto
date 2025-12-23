import ClearIcon from '@experience/shared/assets/icons/clear-icon.svg?react';
import Button from '@experience/shared/components/Button';
import IconButton from '@experience/shared/components/IconButton';
import InputField from '@experience/shared/components/InputFields/InputField';
import { useCallback, useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import TogglePassword from './TogglePassword';
import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly autoFocus?: boolean;
  readonly onSubmit: (password: string) => Promise<void>;
  /** Error message for the password field (e.g. password policy errors) */
  readonly errorMessage?: string;
  readonly clearErrorMessage?: () => void;
  readonly maxLength?: number;
  readonly beforeFields?: ReactNode;
};

const SetPassword = ({
  className,
  autoFocus,
  onSubmit,
  errorMessage,
  clearErrorMessage,
  maxLength,
  beforeFields,
}: Props) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState<string>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      setNewPasswordError(undefined);
      setConfirmPasswordError(undefined);
      clearErrorMessage?.();

      if (!newPassword) {
        setNewPasswordError(t('error.password_required'));
        return;
      }

      if (!confirmPassword) {
        setConfirmPasswordError(t('error.password_required'));
        return;
      }

      if (confirmPassword !== newPassword) {
        setConfirmPasswordError(t('error.passwords_do_not_match'));
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit(newPassword);
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearErrorMessage, confirmPassword, newPassword, onSubmit, t]
  );

  return (
    <form className={className ?? styles.form} onSubmit={handleSubmit}>
      {beforeFields}
      <InputField
        className={styles.inputField}
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        label={t('input.password')}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        value={newPassword}
        maxLength={maxLength}
        isDanger={Boolean(errorMessage ?? newPasswordError)}
        errorMessage={errorMessage ?? newPasswordError}
        isSuffixFocusVisible={Boolean(newPassword)}
        suffix={
          <IconButton
            onClick={() => {
              setNewPassword('');
            }}
          >
            <ClearIcon />
          </IconButton>
        }
        onChange={(event) => {
          if (event.target instanceof HTMLInputElement) {
            setNewPassword(event.target.value);
          }
        }}
      />

      <InputField
        className={styles.inputField}
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        label={t('input.confirm_password')}
        value={confirmPassword}
        maxLength={maxLength}
        isDanger={Boolean(confirmPasswordError)}
        errorMessage={confirmPasswordError}
        isSuffixFocusVisible={Boolean(confirmPassword)}
        suffix={
          <IconButton
            onClick={() => {
              setConfirmPassword('');
            }}
          >
            <ClearIcon />
          </IconButton>
        }
        onChange={(event) => {
          if (event.target instanceof HTMLInputElement) {
            setConfirmPassword(event.target.value);
          }
        }}
      />

      <TogglePassword isChecked={showPassword} onChange={setShowPassword} />

      <Button
        name="submit"
        title="action.save_password"
        htmlType="submit"
        isLoading={isSubmitting}
      />
    </form>
  );
};

export default SetPassword;
