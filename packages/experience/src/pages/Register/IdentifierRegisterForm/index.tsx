import { AgreeToTermsPolicy, type SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import LockIcon from '@/assets/icons/lock.svg';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { SmartInputField } from '@/components/InputFields';
import type { IdentifierInputValue } from '@/components/InputFields/SmartInputField';
import TermsAndPrivacyCheckbox from '@/containers/TermsAndPrivacyCheckbox';
import useSingleSignOnWatch from '@/hooks/use-single-sign-on-watch';
import useTerms from '@/hooks/use-terms';
import { getGeneralIdentifierErrorMessage, validateIdentifierField } from '@/utils/form';

import * as styles from './index.module.scss';
import useOnSubmit from './use-on-submit';

type Props = {
  readonly className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly autoFocus?: boolean;
  readonly signUpMethods: SignInIdentifier[];
};

type FormState = {
  id: IdentifierInputValue;
};

const IdentifierRegisterForm = ({ className, autoFocus, signUpMethods }: Props) => {
  const { t } = useTranslation();
  const { termsValidation, agreeToTermsPolicy } = useTerms();

  const { errorMessage, clearErrorMessage, onSubmit } = useOnSubmit();

  const {
    watch,
    handleSubmit,
    formState: { errors, isValid },
    control,
  } = useForm<FormState>({
    reValidateMode: 'onBlur',
  });

  // Watch identifier field and check single sign on method availability
  const { showSingleSignOnForm, navigateToSingleSignOn } = useSingleSignOnWatch(watch('id'));

  useEffect(() => {
    if (!isValid) {
      clearErrorMessage();
    }
  }, [clearErrorMessage, isValid]);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      clearErrorMessage();

      void handleSubmit(async ({ id: { type, value } }) => {
        if (!type) {
          return;
        }

        if (showSingleSignOnForm) {
          await navigateToSingleSignOn();
          return;
        }

        if (!(await termsValidation())) {
          return;
        }

        await onSubmit(type, value);
      })(event);
    },
    [
      clearErrorMessage,
      handleSubmit,
      navigateToSingleSignOn,
      onSubmit,
      showSingleSignOnForm,
      termsValidation,
    ]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <Controller
        control={control}
        name="id"
        rules={{
          validate: ({ type, value }) => {
            if (!type || !value) {
              return getGeneralIdentifierErrorMessage(signUpMethods, 'required');
            }

            const errorMessage = validateIdentifierField(type, value);

            if (errorMessage) {
              return typeof errorMessage === 'string'
                ? t(`error.${errorMessage}`)
                : t(`error.${errorMessage.code}`, errorMessage.data ?? {});
            }

            return true;
          },
        }}
        render={({ field }) => (
          <SmartInputField
            autoComplete="off"
            autoFocus={autoFocus}
            className={styles.inputField}
            {...field}
            isDanger={!!errors.id || !!errorMessage}
            errorMessage={errors.id?.message}
            enabledTypes={signUpMethods}
          />
        )}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      {showSingleSignOnForm && (
        <div className={styles.message}>{t('description.single_sign_on_enabled')}</div>
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
          /**
           * Hide the terms checkbox when the policy is set to `Automatic`.
           * In registration, the terms checkbox is always shown for `Manual` and `ManualRegistrationOnly` policies.
           */
          agreeToTermsPolicy === AgreeToTermsPolicy.Automatic && styles.hidden
        )}
      />

      <Button
        name="submit"
        title={showSingleSignOnForm ? 'action.single_sign_on' : 'action.create_account'}
        icon={showSingleSignOnForm ? <LockIcon /> : undefined}
        htmlType="submit"
      />

      <input hidden type="submit" />
    </form>
  );
};

export default IdentifierRegisterForm;
