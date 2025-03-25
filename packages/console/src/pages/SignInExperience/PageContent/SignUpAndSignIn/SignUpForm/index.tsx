import { SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { isDevFeaturesEnabled } from '@/consts/env';
import Card from '@/ds-components/Card';
import Checkbox from '@/ds-components/Checkbox';
import FormField from '@/ds-components/FormField';
import Select from '@/ds-components/Select';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';

import { SignUpIdentifier } from '../../../types';
import type { SignInExperienceForm } from '../../../types';
import FormFieldDescription from '../../components/FormFieldDescription';
import FormSectionTitle from '../../components/FormSectionTitle';
import {
  signUpIdentifierPhrase,
  signUpIdentifiers,
  signUpIdentifiersMapping,
} from '../../constants';
import ConnectorSetupWarning from '../components/ConnectorSetupWarning';
import {
  createSignInMethod,
  getSignUpRequiredConnectorTypes,
  isVerificationRequiredSignUpIdentifiers,
} from '../utils';

import styles from './index.module.scss';

function SignUpForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors, submitCount },
  } = useFormContext<SignInExperienceForm>();

  const { isConnectorTypeEnabled } = useEnabledConnectorTypes();

  const signUp = watch('signUp');
  const { identifier: signUpIdentifier } = signUp;
  const isUsernamePasswordSignUp = signUpIdentifier === SignUpIdentifier.Username;

  const postSignUpIdentifierChange = useCallback(
    (signUpIdentifier: SignUpIdentifier) => {
      if (signUpIdentifier === SignUpIdentifier.Username) {
        setValue('signUp.password', true);
        setValue('signUp.verify', false);
        return;
      }

      if (signUpIdentifier === SignUpIdentifier.None) {
        setValue('signUp.password', false);
        setValue('signUp.verify', false);
        return;
      }

      if (isVerificationRequiredSignUpIdentifiers(signUpIdentifier)) {
        setValue('signUp.verify', true);
      }
    },
    [setValue]
  );

  const refreshSignInMethods = () => {
    const signInMethods = getValues('signIn.methods');
    const { verify, password, identifier } = signUp;
    const enabledSignUpIdentifiers = signUpIdentifiersMapping[identifier];

    // Auto append newly assigned sign-up identifiers to the sign-in methods list if they don't already exist
    // User may remove them manually if they don't want to use it for sign-in.
    const mergedSignInMethods = enabledSignUpIdentifiers.reduce((methods, requiredIdentifier) => {
      if (signInMethods.some(({ identifier }) => identifier === requiredIdentifier)) {
        return methods;
      }

      return [...methods, createSignInMethod(requiredIdentifier)];
    }, signInMethods);

    // Note: if verification is required, but password is not set for sign-up, then
    // make sure all the email and phone sign-in methods have verification code enabled.
    const isVerificationCodeRequired = verify && !password;

    setValue(
      'signIn.methods',
      // Note: refresh sign-in authentications according to the sign-up authentications config
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
          verificationCode: isVerificationCodeRequired ? true : method.verificationCode,
        };
      })
    );

    // Note: we need to revalidate the sign-in methods after we have submitted
    if (submitCount) {
      // Note: wait for the form to be updated before validating the new data.
      setTimeout(() => {
        void trigger('signIn.methods');
      }, 0);
    }
  };

  return (
    <Card>
      <FormSectionTitle title="sign_up_and_sign_in.sign_up.title" />
      <FormField title="sign_in_exp.sign_up_and_sign_in.sign_up.sign_up_identifier">
        <FormFieldDescription>
          {t('sign_in_exp.sign_up_and_sign_in.sign_up.identifier_description')}
        </FormFieldDescription>
        <Controller
          name="signUp.identifier"
          control={control}
          rules={{
            validate: (value) => {
              return getSignUpRequiredConnectorTypes(value).every((connectorType) =>
                isConnectorTypeEnabled(connectorType)
              );
            },
          }}
          render={({ field: { value, onChange } }) => (
            <Select
              value={value}
              error={Boolean(errors.signUp?.identifier)}
              options={signUpIdentifiers.map((identifier) => ({
                value: identifier,
                title: (
                  <div>
                    {t(signUpIdentifierPhrase[identifier])}
                    {identifier === SignUpIdentifier.None && (
                      <span className={styles.socialOnlyDescription}>
                        {t(
                          'sign_in_exp.sign_up_and_sign_in.sign_up.social_only_creation_description'
                        )}
                      </span>
                    )}
                  </div>
                ),
              }))}
              onChange={(value) => {
                if (!value) {
                  return;
                }
                onChange(value);
                postSignUpIdentifierChange(value);
                refreshSignInMethods();
              }}
            />
          )}
        />
        <ConnectorSetupWarning
          requiredConnectors={getSignUpRequiredConnectorTypes(signUpIdentifier)}
        />
      </FormField>
      {signUpIdentifier !== SignUpIdentifier.None && (
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
                  disabled={!isDevFeaturesEnabled && isUsernamePasswordSignUp}
                  checked={value}
                  tooltip={conditional(
                    !isDevFeaturesEnabled &&
                      isUsernamePasswordSignUp &&
                      t('sign_in_exp.sign_up_and_sign_in.tip.set_a_password')
                  )}
                  onChange={(value) => {
                    onChange(value);
                    refreshSignInMethods();
                  }}
                />
              )}
            />
            {isVerificationRequiredSignUpIdentifiers(signUpIdentifier) && (
              <Controller
                name="signUp.verify"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox
                    disabled
                    label={t('sign_in_exp.sign_up_and_sign_in.sign_up.verify_at_sign_up_option')}
                    checked={value}
                    tooltip={t('sign_in_exp.sign_up_and_sign_in.tip.verify_at_sign_up')}
                    onChange={(value) => {
                      onChange(value);
                      refreshSignInMethods();
                    }}
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
