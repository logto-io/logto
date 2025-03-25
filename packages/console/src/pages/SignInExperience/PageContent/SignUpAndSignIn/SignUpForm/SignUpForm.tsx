import { AlternativeSignUpIdentifier, SignInIdentifier } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';
import Checkbox from '@/ds-components/Checkbox';
import FormField from '@/ds-components/FormField';

import type { SignInExperienceForm } from '../../../types';
import FormFieldDescription from '../../components/FormFieldDescription';
import FormSectionTitle from '../../components/FormSectionTitle';
import { createSignInMethod } from '../utils';

import SignUpIdentifiersEditBox from './SignUpIdentifiersEditBox';
import styles from './index.module.scss';

function SignUpForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    setValue,
    getValues,
    trigger,
    formState: { submitCount },
  } = useFormContext<SignInExperienceForm>();

  const signUpIdentifiers = useWatch({
    control,
    name: 'signUp.identifiers',
  });

  const { shouldShowAuthenticationFields, shouldShowVerificationField } = useMemo(() => {
    return {
      shouldShowAuthenticationFields: signUpIdentifiers.length > 0,
      shouldShowVerificationField: signUpIdentifiers[0]?.identifier !== SignInIdentifier.Username,
    };
  }, [signUpIdentifiers]);

  // Sync sign-in methods when sign-up methods change
  const syncSignInMethods = useCallback(() => {
    const signInMethods = getValues('signIn.methods');
    const signUp = getValues('signUp');

    const { password, identifiers } = signUp;

    const enabledSignUpIdentifiers = identifiers.reduce<SignInIdentifier[]>(
      (identifiers, { identifier: signUpIdentifier }) => {
        if (signUpIdentifier === AlternativeSignUpIdentifier.EmailOrPhone) {
          return [...identifiers, SignInIdentifier.Email, SignInIdentifier.Phone];
        }

        return [...identifiers, signUpIdentifier];
      },
      []
    );

    // Note: Auto append newly assigned sign-up identifiers to the sign-in methods list if they don't already exist
    // User may remove them manually if they don't want to use it for sign-in.
    const mergedSignInMethods = enabledSignUpIdentifiers.reduce((methods, signUpIdentifier) => {
      if (signInMethods.some(({ identifier }) => identifier === signUpIdentifier)) {
        return methods;
      }

      return [...methods, createSignInMethod(signUpIdentifier)];
    }, signInMethods);

    setValue(
      'signIn.methods',
      mergedSignInMethods.map((method) => {
        const { identifier } = method;

        if (identifier === SignInIdentifier.Username) {
          return method;
        }

        return {
          ...method,
          // Auto enabled password for email and phone sign-in methods if password is required for sign-up.
          // User may disable it manually if they don't want to use password for email or phone sign-in.
          password: method.password || password,
          // Note: if password is not set for sign-up,
          // then auto enable verification code for email and phone sign-in methods.
          verificationCode: password ? method.verificationCode : true,
        };
      })
    );

    // Note: we need to revalidate the sign-in methods after the signIn form data has been updated
    if (submitCount) {
      // Wait for the form re-render before validating the new data.
      setTimeout(() => {
        void trigger('signIn.methods');
      }, 0);
    }
  }, [getValues, setValue, submitCount, trigger]);

  return (
    <Card>
      <FormSectionTitle title="sign_up_and_sign_in.sign_up.title" />
      <FormField title="sign_in_exp.sign_up_and_sign_in.sign_up.sign_up_identifier">
        <FormFieldDescription>
          {t('sign_in_exp.sign_up_and_sign_in.sign_up.identifier_description')}
        </FormFieldDescription>
        <SignUpIdentifiersEditBox syncSignInMethods={syncSignInMethods} />
      </FormField>
      {shouldShowAuthenticationFields && (
        <FormField title="sign_in_exp.sign_up_and_sign_in.sign_up.sign_up_authentication">
          <FormFieldDescription>
            {t('sign_in_exp.sign_up_and_sign_in.sign_up.authentication_description')}
          </FormFieldDescription>
          <div className={styles.selections}>
            <Controller
              name="signUp.password"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  label={t('sign_in_exp.sign_up_and_sign_in.sign_up.set_a_password_option')}
                  checked={value}
                  onChange={(value) => {
                    onChange(value);
                    syncSignInMethods();
                  }}
                />
              )}
            />
            {shouldShowVerificationField && (
              <Controller
                name="signUp.verify"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox
                    disabled
                    label={t('sign_in_exp.sign_up_and_sign_in.sign_up.verify_at_sign_up_option')}
                    checked={value}
                    tooltip={t('sign_in_exp.sign_up_and_sign_in.tip.verify_at_sign_up')}
                    onChange={onChange}
                  />
                )}
              />
            )}
          </div>
        </FormField>
      )}
    </Card>
  );
}

export default SignUpForm;
