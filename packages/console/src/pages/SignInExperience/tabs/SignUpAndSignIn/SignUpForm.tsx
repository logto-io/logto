import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { snakeCase } from 'snake-case';

import Card from '@/components/Card';
import Checkbox from '@/components/Checkbox';
import FormField from '@/components/FormField';
import Select from '@/components/Select';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';

import { signUpIdentifiers, signUpIdentifiersMapping } from '../../constants';
import type { SignInExperienceForm } from '../../types';
import { SignUpIdentifier } from '../../types';
import {
  getSignUpRequiredConnectorTypes,
  isVerificationRequiredSignUpIdentifiers,
} from '../../utils/identifier';
import * as styles from '../index.module.scss';
import ConnectorSetupWarning from './components/ConnectorSetupWarning';
import {
  getSignInMethodPasswordCheckState,
  getSignInMethodVerificationCodeCheckState,
} from './components/SignInMethodEditBox/utilities';

const SignUpForm = () => {
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

  const { identifier: signUpIdentifier } = watch('signUp') ?? {};

  if (!signUpIdentifier) {
    return null;
  }

  const postSignUpIdentifierChange = (signUpIdentifier: SignUpIdentifier) => {
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
  };

  const refreshSignInMethods = () => {
    const signUpIdentifier = getValues('signUp.identifier');
    const signInMethods = getValues('signIn.methods');
    const isSignUpPasswordRequired = getValues('signUp.password');

    // Note: append required sign-in methods according to the sign-up identifier config
    const requiredSignInIdentifiers = signUpIdentifiersMapping[signUpIdentifier];
    const allSignInMethods = requiredSignInIdentifiers.reduce((methods, requiredIdentifier) => {
      if (signInMethods.some(({ identifier }) => identifier === requiredIdentifier)) {
        return methods;
      }

      return [
        ...methods,
        {
          identifier: requiredIdentifier,
          password: getSignInMethodPasswordCheckState(requiredIdentifier, isSignUpPasswordRequired),
          verificationCode: getSignInMethodVerificationCodeCheckState(requiredIdentifier),
          isPasswordPrimary: true,
        },
      ];
    }, signInMethods);

    setValue(
      'signIn.methods',
      // Note: refresh sign-in authentications according to the sign-up authentications config
      allSignInMethods.map((method) => {
        const { identifier, password } = method;

        return {
          ...method,
          password: getSignInMethodPasswordCheckState(
            identifier,
            isSignUpPasswordRequired,
            password
          ),
          verificationCode: getSignInMethodVerificationCodeCheckState(identifier),
        };
      })
    );

    // Note: we need to revalidate the sign-in methods after we have submitted
    if (submitCount) {
      void trigger('signIn.methods');
    }
  };

  return (
    <Card>
      <div className={styles.title}>{t('sign_in_exp.sign_up_and_sign_in.sign_up.title')}</div>
      <FormField title="sign_in_exp.sign_up_and_sign_in.sign_up.sign_up_identifier">
        <div className={styles.formFieldDescription}>
          {t('sign_in_exp.sign_up_and_sign_in.sign_up.identifier_description')}
        </div>
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
              hasError={Boolean(errors.signUp?.identifier)}
              options={signUpIdentifiers.map((identifier) => ({
                value: identifier,
                title: (
                  <div>
                    {t('sign_in_exp.sign_up_and_sign_in.identifiers', {
                      context: snakeCase(identifier),
                    })}
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
          <div className={styles.formFieldDescription}>
            {t('sign_in_exp.sign_up_and_sign_in.sign_up.authentication_description')}
          </div>
          <div className={styles.selections}>
            <Controller
              name="signUp.password"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  label={t('sign_in_exp.sign_up_and_sign_in.sign_up.set_a_password_option')}
                  disabled={signUpIdentifier === SignUpIdentifier.Username}
                  value={value}
                  disabledTooltip={t('sign_in_exp.sign_up_and_sign_in.tip.set_a_password')}
                  onChange={(value) => {
                    onChange(value);
                    refreshSignInMethods();
                  }}
                />
              )}
            />
            {signUpIdentifier !== SignUpIdentifier.Username && (
              <Controller
                name="signUp.verify"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox
                    label={t('sign_in_exp.sign_up_and_sign_in.sign_up.verify_at_sign_up_option')}
                    value={value}
                    disabled={isVerificationRequiredSignUpIdentifiers(signUpIdentifier)}
                    disabledTooltip={t('sign_in_exp.sign_up_and_sign_in.tip.verify_at_sign_up')}
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
};

export default SignUpForm;
