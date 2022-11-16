import { SignUpIdentifier } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { snakeCase } from 'snake-case';

import Checkbox from '@/components/Checkbox';
import FormField from '@/components/FormField';
import Select from '@/components/Select';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';

import type { SignInExperienceForm } from '../../types';
import ConnectorSetupWarning from './components/ConnectorSetupWarning';
import {
  requiredVerifySignUpIdentifiers,
  signUpIdentifiers,
  signUpIdentifierToRequiredConnectorMapping,
} from './constants';
import * as styles from './index.module.scss';

const SignUpForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<SignInExperienceForm>();
  const { isConnectorTypeEnabled } = useEnabledConnectorTypes();

  const signUpIdentifier = watch('signUp.identifier');

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

    if (requiredVerifySignUpIdentifiers.includes(signUpIdentifier)) {
      setValue('signUp.verify', true);
    }
  };

  return (
    <>
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
              if (!value) {
                return false;
              }

              return signUpIdentifierToRequiredConnectorMapping[value].every((connectorType) =>
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
              }}
            />
          )}
        />
        <ConnectorSetupWarning
          requiredConnectors={signUpIdentifierToRequiredConnectorMapping[signUpIdentifier]}
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
                  value={value ?? false}
                  disabledTooltip={t('sign_in_exp.sign_up_and_sign_in.tip.set_a_password')}
                  onChange={onChange}
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
                    value={value ?? false}
                    disabled={requiredVerifySignUpIdentifiers.includes(signUpIdentifier)}
                    disabledTooltip={t('sign_in_exp.sign_up_and_sign_in.tip.verify_at_sign_up')}
                    onChange={onChange}
                  />
                )}
              />
            )}
          </div>
        </FormField>
      )}
    </>
  );
};

export default SignUpForm;
