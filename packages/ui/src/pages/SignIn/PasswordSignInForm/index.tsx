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
import {
  identifierErrorWatcher,
  passwordErrorWatcher,
  validateIdentifierField,
} from '@/utils/form';

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
  const { isForgotPasswordEnabled, ...passwordlessMethod } = useForgotPasswordSettings();

  const [inputType, setInputType] = useState<IdentifierInputType>(
    signInMethods[0] ?? SignInIdentifier.Username
  );

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

  const identifierError = identifierErrorWatcher(signInMethods, errors.identifier);
  const passwordError = passwordErrorWatcher(errors.password);

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <SmartInputField
        required
        autoComplete="identifier"
        autoFocus={autoFocus}
        className={styles.inputField}
        currentType={inputType}
        isDanger={!!identifierError}
        error={identifierError}
        enabledTypes={signInMethods}
        onTypeChange={setInputType}
        {...register('identifier', {
          required: true,
          validate: (value) => {
            const errorMessage = validateIdentifierField(inputType, value);

            if (errorMessage) {
              return typeof errorMessage === 'string'
                ? t(`error.${errorMessage}`)
                : t(`error.${errorMessage.code}`, errorMessage.data);
            }

            return true;
          },
        })}
        /* Overwrite default input onChange handler  */
        onChange={(value) => {
          setValue('identifier', value, { shouldValidate: isSubmitted, shouldDirty: true });
        }}
      />

      <PasswordInputField
        required
        className={styles.inputField}
        autoComplete="current-password"
        placeholder={t('input.password')}
        isDanger={!!passwordError}
        error={passwordError}
        {...register('password', { required: true })}
      />

      {isForgotPasswordEnabled && (
        <ForgotPasswordLink
          className={styles.link}
          method={passwordlessMethod.email ? SignInIdentifier.Email : SignInIdentifier.Phone}
        />
      )}

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <TermsOfUse className={styles.terms} />

      <Button name="submit" title="action.sign_in" htmlType="submit" />

      <input hidden type="submit" />
    </form>
  );
};

export default PasswordSignInForm;
