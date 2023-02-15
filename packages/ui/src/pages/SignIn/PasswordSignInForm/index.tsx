import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import type { IdentifierInputType } from '@/components/InputFields';
import { SmartInputField, PasswordInputField } from '@/components/InputFields';
import ForgotPasswordLink from '@/containers/ForgotPasswordLink';
import TermsOfUse from '@/containers/TermsOfUse';
import usePasswordSignIn from '@/hooks/use-password-sign-in';
import { useForgotPasswordSettings } from '@/hooks/use-sie';
import useTerms from '@/hooks/use-terms';
import { getGeneralIdentifierErrorMessage, validateIdentifierField } from '@/utils/form';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  signInMethods: SignInIdentifier[];
};

type FormState = {
  identifier: string;
  password: string;
};

const PasswordSignInForm = ({ className, autoFocus, signInMethods }: Props) => {
  const { t } = useTranslation();

  const { termsValidation } = useTerms();
  const { errorMessage, clearErrorMessage, onSubmit } = usePasswordSignIn();
  const { isForgotPasswordEnabled } = useForgotPasswordSettings();

  const [inputType, setInputType] = useState<IdentifierInputType>(
    signInMethods[0] ?? SignInIdentifier.Username
  );

  const {
    watch,
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormState>({
    reValidateMode: 'onChange',
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage();

      void handleSubmit(async ({ identifier, password }, event) => {
        if (!(await termsValidation())) {
          return;
        }

        await onSubmit({
          [inputType]: identifier,
          password,
        });
      })(event);
    },
    [clearErrorMessage, handleSubmit, inputType, onSubmit, termsValidation]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Controller
        control={control}
        name="identifier"
        rules={{
          required: getGeneralIdentifierErrorMessage(signInMethods, 'required'),
          validate: (value) => {
            const errorMessage = validateIdentifierField(inputType, value);

            return errorMessage ? getGeneralIdentifierErrorMessage(signInMethods, 'invalid') : true;
          },
        }}
        render={({ field }) => (
          <SmartInputField
            autoComplete="identifier"
            autoFocus={autoFocus}
            className={styles.inputField}
            {...field}
            currentType={inputType}
            isDanger={!!errors.identifier}
            errorMessage={errors.identifier?.message}
            enabledTypes={signInMethods}
            onTypeChange={setInputType}
          />
        )}
      />

      <PasswordInputField
        className={styles.inputField}
        autoComplete="current-password"
        placeholder={t('input.password')}
        isDanger={!!errors.password}
        errorMessage={errors.password?.message}
        {...register('password', { required: t('error.password_required') })}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      {isForgotPasswordEnabled && (
        <ForgotPasswordLink
          className={styles.link}
          identifier={inputType}
          value={watch('identifier')}
        />
      )}

      <TermsOfUse className={styles.terms} />

      <Button name="submit" title="action.sign_in" htmlType="submit" />

      <input hidden type="submit" />
    </form>
  );
};

export default PasswordSignInForm;
