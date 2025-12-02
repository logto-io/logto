import Button from '@experience/shared/components/Button';
import ErrorMessage from '@experience/shared/components/ErrorMessage';
import PasswordInputField from '@experience/shared/components/InputFields/PasswordInputField';
import { useCallback, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly autoFocus?: boolean;
  readonly onSubmit: (password: string) => Promise<void>;
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
  const [localError, setLocalError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mergedError = useMemo(() => localError ?? errorMessage, [errorMessage, localError]);

  const handleSubmit = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      setLocalError(undefined);
      clearErrorMessage?.();

      if (!newPassword || !confirmPassword) {
        return;
      }

      if (confirmPassword !== newPassword) {
        setLocalError(t('error.passwords_do_not_match'));
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
      <PasswordInputField
        className={styles.inputField}
        autoComplete="new-password"
        label={t('input.password')}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        value={newPassword}
        maxLength={maxLength}
        onChange={(event) => {
          if (event.target instanceof HTMLInputElement) {
            setNewPassword(event.target.value);
          }
        }}
      />

      <PasswordInputField
        className={styles.inputField}
        autoComplete="new-password"
        label={t('input.confirm_password')}
        value={confirmPassword}
        maxLength={maxLength}
        onChange={(event) => {
          if (event.target instanceof HTMLInputElement) {
            setConfirmPassword(event.target.value);
          }
        }}
      />

      {mergedError && <ErrorMessage className={styles.errors}>{mergedError}</ErrorMessage>}

      <Button
        name="submit"
        title="action.save_password"
        htmlType="submit"
        isLoading={isSubmitting}
        disabled={!newPassword || !confirmPassword}
      />
    </form>
  );
};

export default SetPassword;
