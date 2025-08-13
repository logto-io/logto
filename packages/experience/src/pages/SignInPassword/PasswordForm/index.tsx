import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { PasswordInputField } from '@/components/InputFields';
import type { IdentifierInputValue } from '@/components/InputFields/SmartInputField';
import CaptchaBox from '@/containers/CaptchaBox';
import ForgotPasswordLink from '@/containers/ForgotPasswordLink';
import usePasswordSignIn from '@/hooks/use-password-sign-in';
import { useForgotPasswordSettings } from '@/hooks/use-sie';

import styles from '../index.module.scss';

import VerificationCodeLink from './VerificationCodeLink';

type Props = {
  readonly className?: string;
  readonly identifier: SignInIdentifier;
  readonly value: string;
  readonly isVerificationCodeEnabled?: boolean;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly autoFocus?: boolean;
};

type FormState = {
  identifier: IdentifierInputValue;
  password: string;
};

const PasswordForm = ({
  className,
  autoFocus,
  isVerificationCodeEnabled = false,
  identifier,
  value,
}: Props) => {
  const { t } = useTranslation();
  const { errorMessage, clearErrorMessage, onSubmit } = usePasswordSignIn();
  const { setIdentifierInputValue } = useContext(UserInteractionContext);
  const { isForgotPasswordEnabled } = useForgotPasswordSettings();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormState>({
    reValidateMode: 'onBlur',
    defaultValues: {
      identifier: {
        type: identifier,
        value,
      },
      password: '',
    },
  });

  useEffect(() => {
    if (!isValid) {
      clearErrorMessage();
    }
  }, [clearErrorMessage, isValid]);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage();

      await handleSubmit(async ({ identifier: { type, value }, password }) => {
        if (!type) {
          return;
        }

        setIdentifierInputValue({ type, value });

        await onSubmit({
          identifier: { type, value },
          password,
        });
      })(event);
    },
    [clearErrorMessage, handleSubmit, onSubmit, setIdentifierInputValue]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Controller
        control={control}
        name="identifier"
        render={({
          field: {
            name,
            value: { type, value },
          },
        }) => <input readOnly hidden name={name} value={value} autoComplete={type} />}
      />

      <PasswordInputField
        autoFocus={autoFocus}
        className={styles.inputField}
        autoComplete="current-password"
        label={t('input.password')}
        isDanger={!!errors.password}
        errorMessage={errors.password?.message}
        {...register('password', { required: t('error.password_required') })}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      {isForgotPasswordEnabled && (
        <ForgotPasswordLink className={styles.link} identifier={identifier} value={value} />
      )}

      <CaptchaBox />
      <Button title="action.continue" name="submit" htmlType="submit" isLoading={isSubmitting} />

      {identifier !== SignInIdentifier.Username && isVerificationCodeEnabled && (
        <VerificationCodeLink className={styles.switch} identifier={identifier} value={value} />
      )}

      <input hidden type="submit" />
    </form>
  );
};

export default PasswordForm;
