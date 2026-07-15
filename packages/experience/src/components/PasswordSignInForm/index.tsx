import { AgreeToTermsPolicy, type SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useCallback, useContext, useEffect } from 'react';
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

  const { errorMessage, clearErrorMessage, onSubmit } = usePasswordSignIn();
  // Persistent error message passed via the navigation state (e.g. suspended user error from
  // the enterprise SSO callback). Follows the same clearing rules as the form's own error message.
  const { errorMessage: locationErrorMessage, clearErrorMessage: clearLocationErrorMessage } =
    useLocationErrorMessage();
  const { isForgotPasswordEnabled } = useForgotPasswordSettings();
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const { setIdentifierInputValue } = useContext(UserInteractionContext);
  const { isPasskeyFlowProcessing } = useContext(WebAuthnContext);
  const prefilledIdentifier = usePrefilledIdentifier({ enabledIdentifiers: signInMethods });

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

  // The submission error message takes precedence over the persistent one from the navigation
  // state. `conditional` is needed since the cleared error message is an empty string.
  const displayErrorMessage = conditional(errorMessage) ?? locationErrorMessage;

  const { value: identifierValue } = watch('identifier');

  useEffect(() => {
    // Clear the persistent error message from the navigation state once the user modifies
    // the identifier input. Can not rely on the `isValid`/`isDirty` form state since the
    // identifier input emits an initial change event on mount.
    if (identifierValue !== prefilledIdentifier.value) {
      clearLocationErrorMessage();
    }
  }, [clearLocationErrorMessage, identifierValue, prefilledIdentifier.value]);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      if (isPasskeyFlowProcessing) {
        return;
      }

      clearErrorMessage();
      clearLocationErrorMessage();

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
      clearLocationErrorMessage,
      handleSubmit,
      navigateToSingleSignOn,
      onSubmit,
      setIdentifierInputValue,
      showSingleSignOnForm,
      termsValidation,
      isPasskeyFlowProcessing,
    ]
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

      {displayErrorMessage && (
        <ErrorMessage className={styles.formErrors}>{displayErrorMessage}</ErrorMessage>
      )}

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
