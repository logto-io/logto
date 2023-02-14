import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import ForgotPasswordLink from '@/components/ForgotPasswordLink';
import type { IdentifierInputType } from '@/components/InputFields';
import { SmartInputField, PasswordInputField } from '@/components/InputFields';
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
  const { getEnabledRetrievePasswordIdentifier } = useForgotPasswordSettings();

  const [inputType, setInputType] = useState<IdentifierInputType>(
    signInMethods[0] ?? SignInIdentifier.Username
  );

  const forgotPasswordIdentifier = getEnabledRetrievePasswordIdentifier(inputType);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<FormState>({
    reValidateMode: 'onChange',
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage();

      void handleSubmit(async ({ identifier, password }, event) => {
        event?.preventDefault();

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
      <SmartInputField
        autoComplete="identifier"
        autoFocus={autoFocus}
        className={styles.inputField}
        currentType={inputType}
        isDanger={!!errors.identifier}
        errorMessage={errors.identifier?.message}
        enabledTypes={signInMethods}
        onTypeChange={setInputType}
        {...register('identifier', {
          required: getGeneralIdentifierErrorMessage(signInMethods, 'required'),
          validate: (value) => {
            const errorMessage = validateIdentifierField(inputType, value);

            return errorMessage ? getGeneralIdentifierErrorMessage(signInMethods, 'invalid') : true;
          },
        })}
        /* Overwrite default input onChange handler  */
        onChange={(value) => {
          setValue('identifier', value, { shouldValidate: isSubmitted, shouldDirty: true });
        }}
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

      {forgotPasswordIdentifier && (
        <ForgotPasswordLink className={styles.link} method={forgotPasswordIdentifier} />
      )}

      <TermsOfUse className={styles.terms} />

      <Button name="submit" title="action.sign_in" htmlType="submit" />

      <input hidden type="submit" />
    </form>
  );
};

export default PasswordSignInForm;
