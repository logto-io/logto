import { AlternativeSignUpIdentifier, SignInIdentifier } from '@logto/schemas';
import { useEffect, useMemo } from 'react';
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
    formState: { submitCount, dirtyFields },
  } = useFormContext<SignInExperienceForm>();

  // Note: `useWatch` is a hook that returns the updated value on every render.
  // Unlike `watch`, it doesn't require a re-render to get the updated value (alway return the current ref).
  const signUp = useWatch({
    control,
    name: 'signUp',
  });

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

  // Should sync the sign-up identifier auth settings when the sign-up identifiers changed
  // TODO: need to check with designer
  useEffect(() => {
    // Only trigger the effect when the identifiers field is dirty
    const isIdentifiersDirty = dirtyFields.signUp?.identifiers;
    if (!isIdentifiersDirty) {
      return;
    }

    const identifiers = signUpIdentifiers.map(({ identifier }) => identifier);
    if (identifiers.length === 0) {
      setValue('signUp.password', false);
      setValue('signUp.verify', false);
      return;
    }

    if (identifiers.includes(SignInIdentifier.Username)) {
      setValue('signUp.password', true);
    }

    // Disable verification when the primary identifier is username,
    // otherwise enable it for the rest of the identifiers (email, phone, emailOrPhone)
    setValue('signUp.verify', identifiers[0] !== SignInIdentifier.Username);
  }, [dirtyFields.signUp?.identifiers, setValue, signUpIdentifiers]);

  // Sync sign-in methods when sign-up methods change
  useEffect(() => {
    // Only trigger the effect when the sign-up field is dirty
    const isIdentifiersDirty = dirtyFields.signUp;
    if (!isIdentifiersDirty) {
      return;
    }

    const signInMethods = getValues('signIn.methods');
    const { password, identifiers } = signUp;

    // Note: Auto append newly assigned sign-up identifiers to the sign-in methods list if they don't already exist
    // User may remove them manually if they don't want to use it for sign-in.
    const mergedSignInMethods = identifiers.reduce((methods, { identifier: signUpIdentifier }) => {
      if (signInMethods.some(({ identifier }) => identifier === signUpIdentifier)) {
        return methods;
      }

      const newSignInMethods =
        signUpIdentifier === AlternativeSignUpIdentifier.EmailOrPhone
          ? [createSignInMethod(SignInIdentifier.Email), createSignInMethod(SignInIdentifier.Phone)]
          : [createSignInMethod(signUpIdentifier)];

      return [...methods, ...newSignInMethods];
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
  }, [dirtyFields.signUp, getValues, setValue, signUp, submitCount, trigger]);

  return (
    <Card>
      <FormSectionTitle title="sign_up_and_sign_in.sign_up.title" />
      <FormField title="sign_in_exp.sign_up_and_sign_in.sign_up.sign_up_identifier">
        <FormFieldDescription>
          {t('sign_in_exp.sign_up_and_sign_in.sign_up.identifier_description')}
        </FormFieldDescription>
        <SignUpIdentifiersEditBox />
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
                  onChange={onChange}
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
