import type { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import LockIcon from '@/assets/icons/lock.svg';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { SmartInputField, PasswordInputField } from '@/components/InputFields';
import type { IdentifierInputValue } from '@/components/InputFields/SmartInputField';
import ForgotPasswordLink from '@/containers/ForgotPasswordLink';
import usePasswordSignIn from '@/hooks/use-password-sign-in';
import { useForgotPasswordSettings } from '@/hooks/use-sie';
import { getGeneralIdentifierErrorMessage, validateIdentifierField } from '@/utils/form';

import * as styles from './index.module.scss';
import useSingleSignOnWatch from './use-single-sign-on-watch';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  signInMethods: SignInIdentifier[];
};

export type FormState = {
  identifier: IdentifierInputValue;
  password: string;
};

const PasswordSignInForm = ({ className, autoFocus, signInMethods }: Props) => {
  const { t } = useTranslation();

  const { errorMessage, clearErrorMessage, onSubmit } = usePasswordSignIn();
  const { isForgotPasswordEnabled } = useForgotPasswordSettings();

  const {
    watch,
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<FormState>({
    reValidateMode: 'onBlur',
    defaultValues: {
      identifier: {},
      password: '',
    },
  });

  const { showSingleSignOn, navigateToSingleSignOn } = useSingleSignOnWatch(control);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage();

      void handleSubmit(async ({ identifier: { type, value }, password }) => {
        if (showSingleSignOn) {
          navigateToSingleSignOn();
          return;
        }

        if (!type) {
          return;
        }

        await onSubmit({
          [type]: value,
          password,
        });
      })(event);
    },
    [clearErrorMessage, handleSubmit, navigateToSingleSignOn, onSubmit, showSingleSignOn]
  );

  useEffect(() => {
    if (!isValid) {
      clearErrorMessage();
    }
  }, [clearErrorMessage, isValid]);

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Controller
        control={control}
        name="identifier"
        rules={{
          validate: ({ type, value }) => {
            if (!type || !value) {
              return getGeneralIdentifierErrorMessage(signInMethods, 'required');
            }

            const errorMessage = validateIdentifierField(type, value);

            return errorMessage ? getGeneralIdentifierErrorMessage(signInMethods, 'invalid') : true;
          },
        }}
        render={({ field }) => (
          <SmartInputField
            autoFocus={autoFocus}
            className={styles.inputField}
            {...field}
            isDanger={!!errors.identifier}
            errorMessage={errors.identifier?.message}
            enabledTypes={signInMethods}
          />
        )}
      />
      {showSingleSignOn && (
        <div className={styles.message}>{t('description.single_sign_on_enabled')}</div>
      )}

      {!showSingleSignOn && (
        <PasswordInputField
          className={styles.inputField}
          autoComplete="current-password"
          placeholder={t('input.password')}
          isDanger={!!errors.password}
          errorMessage={errors.password?.message}
          {...register('password', { required: t('error.password_required') })}
        />
      )}

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      {isForgotPasswordEnabled && !showSingleSignOn && (
        <ForgotPasswordLink
          className={styles.link}
          identifier={watch('identifier').type}
          value={watch('identifier').value}
        />
      )}

      <Button
        name="submit"
        title={showSingleSignOn ? 'action.single_sign_on' : 'action.sign_in'}
        icon={showSingleSignOn ? <LockIcon /> : undefined}
        htmlType="submit"
      />

      <input hidden type="submit" />
    </form>
  );
};

export default PasswordSignInForm;
