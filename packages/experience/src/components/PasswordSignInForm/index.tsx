import { AgreeToTermsPolicy, type SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import WebAuthnContext from '@/Providers/WebAuthnContextProvider/WebAuthnContext';
import LockIcon from '@/assets/icons/lock.svg?react';
import { SmartInputField, PasswordInputField } from '@/components/InputFields';
import CaptchaBox from '@/containers/CaptchaBox';
import ForgotPasswordLink from '@/containers/ForgotPasswordLink';
import TermsAndPrivacyCheckbox from '@/containers/TermsAndPrivacyCheckbox';
import useLocationErrorMessage from '@/hooks/use-location-error-message';
import usePasswordSignIn from '@/hooks/use-password-sign-in';
import usePrefilledIdentifier from '@/hooks/use-prefilled-identifier';
import { useForgotPasswordSettings } from '@/hooks/use-sie';
import useSingleSignOnWatch from '@/hooks/use-single-sign-on-watch';
import useTerms from '@/hooks/use-terms';
import Button from '@/shared/components/Button';
import ErrorMessage from '@/shared/components/ErrorMessage';
import type { IdentifierInputValue } from '@/shared/components/InputFields/SmartInputField';
import { getGeneralIdentifierErrorMessage, validateIdentifierField } from '@/utils/form';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly autoFocus?: boolean;
  readonly signInMethods: SignInIdentifier[];
};

export type FormState = {
  identifier: IdentifierInputValue;
  password: string;
};

const PasswordSignInForm = ({ className, autoFocus, signInMethods }: Props) => {
  const { t } = useTranslation();

  const {
    errorMessage: submitErrorMessage,
    clearErrorMessage: clearSubmitErrorMessage,
    onSubmit,
  } = usePasswordSignIn();
  const { errorMessage: locationErrorMessage, clearErrorMessage: clearLocationErrorMessage } =
    useLocationErrorMessage();
  const { isForgotPasswordEnabled } = useForgotPasswordSettings();
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const { setIdentifierInputValue } = useContext(UserInteractionContext);
  const { isPasskeyFlowProcessing } = useContext(WebAuthnContext);
  const prefilledIdentifier = usePrefilledIdentifier({ enabledIdentifiers: signInMethods });

  const errorMessage = submitErrorMessage ?? locationErrorMessage;

  const clearErrorMessage = useCallback(() => {
    clearSubmitErrorMessage();
    clearLocationErrorMessage();
  }, [clearLocationErrorMessage, clearSubmitErrorMessage]);

  const {
    watch,
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormState>({
    reValidateMode: 'onBlur',
    defaultValues: {
      identifier: prefilledIdentifier,
      password: '',
    },
  });

  const { showSingleSignOnForm, navigateToSingleSignOn } = useSingleSignOnWatch(
    watch('identifier')
  );

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      if (isPasskeyFlowProcessing) {
        return;
      }

      clearErrorMessage();

      await handleSubmit(async ({ identifier: { type, value }, password }) => {
        if (!type) {
          return;
        }

        setIdentifierInputValue({ type, value });

        if (showSingleSignOnForm) {
          await navigateToSingleSignOn();
          return;
        }

        // Check if the user has agreed to the terms and privacy policy before signing in when the policy is set to `Manual`
        if (agreeToTermsPolicy === AgreeToTermsPolicy.Manual && !(await termsValidation())) {
          return;
        }

        await onSubmit({
          identifier: { type, value },
          password,
        });
      })(event);
    },
    [
      agreeToTermsPolicy,
      clearErrorMessage,
      handleSubmit,
      navigateToSingleSignOn,
      onSubmit,
      setIdentifierInputValue,
      showSingleSignOnForm,
      termsValidation,
      isPasskeyFlowProcessing,
    ]
  );

  // Clear persistent errors when the form becomes invalid after it was valid
  // (e.g. user edits the identifier). Skip the initial mount so location-state
  // errors from SSO callbacks are not wiped before SSO form mode activates.
  const wasValid = useRef(isValid);
  useEffect(() => {
    if (wasValid.current && !isValid) {
      clearErrorMessage();
    }
    // eslint-disable-next-line @silverhand/fp/no-mutation
    wasValid.current = isValid;
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
        render={({ field, formState: { defaultValues } }) => (
          <SmartInputField
            autoFocus={autoFocus}
            className={styles.inputField}
            {...field}
            isDanger={!!errors.identifier}
            errorMessage={errors.identifier?.message}
            enabledTypes={signInMethods}
            defaultValue={defaultValues?.identifier?.value}
          />
        )}
      />
      {showSingleSignOnForm && (
        <div className={styles.message}>{t('description.single_sign_on_enabled')}</div>
      )}

      {!showSingleSignOnForm && (
        <PasswordInputField
          className={styles.inputField}
          autoComplete="current-password"
          label={t('input.password')}
          isDanger={!!errors.password}
          errorMessage={errors.password?.message}
          {...register('password', { required: t('error.password_required') })}
        />
      )}

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      {isForgotPasswordEnabled && !showSingleSignOnForm && (
        <ForgotPasswordLink
          className={styles.link}
          identifier={watch('identifier').type}
          value={watch('identifier').value}
        />
      )}

      {/**
       * Have to use css to hide the terms element.
       * Remove element from dom will trigger a form re-render.
       * Form rerender will trigger autofill.
       * If the autofill value is SSO enabled, it will always show SSO form.
       */}
      <TermsAndPrivacyCheckbox
        className={classNames(
          styles.terms,
          // For sign in, only show the terms checkbox if the terms policy is manual
          agreeToTermsPolicy !== AgreeToTermsPolicy.Manual && styles.hidden
        )}
      />

      <CaptchaBox />

      <Button
        name="submit"
        title={showSingleSignOnForm ? 'action.single_sign_on' : 'action.sign_in'}
        icon={showSingleSignOnForm ? <LockIcon /> : undefined}
        htmlType="submit"
        isLoading={isSubmitting || isPasskeyFlowProcessing}
      />

      <input hidden type="submit" />
    </form>
  );
};

export default PasswordSignInForm;
