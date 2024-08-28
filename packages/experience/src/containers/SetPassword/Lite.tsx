import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { PasswordInputField } from '@/components/InputFields';

import * as styles from './index.module.scss';

type Props = {
  readonly className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly autoFocus?: boolean;
  readonly onSubmit: (password: string) => void;
  readonly errorMessage?: string;
  readonly clearErrorMessage?: () => void;
};

type FieldState = {
  newPassword: string;
};

const Lite = ({ className, autoFocus, onSubmit, errorMessage, clearErrorMessage }: Props) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FieldState>({
    reValidateMode: 'onBlur',
    defaultValues: { newPassword: '' },
  });

  useEffect(() => {
    if (!isValid) {
      clearErrorMessage?.();
    }
  }, [clearErrorMessage, isValid]);

  const onSubmitHandler = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage?.();

      void handleSubmit((data, event) => {
        onSubmit(data.newPassword);
      })(event);
    },
    [clearErrorMessage, handleSubmit, onSubmit]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <PasswordInputField
        className={styles.inputField}
        autoComplete="new-password"
        placeholder={t('input.password')}
        autoFocus={autoFocus}
        isDanger={!!errors.newPassword}
        errorMessage={errors.newPassword?.message}
        aria-invalid={!!errors.newPassword}
        {...register('newPassword', {
          required: t('error.password_required'),
        })}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <Button name="submit" title="action.save_password" htmlType="submit" />

      <input hidden type="submit" />
    </form>
  );
};

export default Lite;
