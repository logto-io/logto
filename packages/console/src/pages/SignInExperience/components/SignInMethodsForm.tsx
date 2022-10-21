import { SignInMethodKey } from '@logto/schemas';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Checkbox from '@/components/Checkbox';
import FormField from '@/components/FormField';
import Select from '@/components/Select';
import Switch from '@/components/Switch';

import type { SignInExperienceForm } from '../types';
import ConnectorSetupWarning from './ConnectorSetupWarning';
import ConnectorsTransfer from './ConnectorsTransfer';
import * as styles from './index.module.scss';

const signInMethods = Object.values(SignInMethodKey);

const SignInMethodsForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { register, watch, control, getValues, setValue } = useFormContext<SignInExperienceForm>();
  const primaryMethod = watch('signInMethods.primary');
  const enableSecondary = watch('signInMethods.enableSecondary');
  const sms = watch('signInMethods.sms');
  const email = watch('signInMethods.email');
  const social = watch('signInMethods.social');

  const postPrimaryMethodChange = (
    oldPrimaryMethod?: SignInMethodKey,
    primaryMethod?: SignInMethodKey
  ) => {
    if (oldPrimaryMethod) {
      // The secondary sign-in method should select the old primary method by default.
      setValue(`signInMethods.${oldPrimaryMethod}`, true);
    }

    if (primaryMethod) {
      // When one of the sign-in methods has been primary, it should not be able to be secondary simultaneously.
      setValue(`signInMethods.${primaryMethod}`, false);
    }
  };

  const secondaryMethodsFields = useMemo(
    () =>
      signInMethods.map((method) => {
        const label = (
          <>
            {t('sign_in_exp.sign_in_methods.methods', { context: method })}
            {primaryMethod === method && (
              <span className={styles.primaryTag}>
                {t('sign_in_exp.sign_in_methods.methods_primary_tag')}
              </span>
            )}
          </>
        );

        const enabled =
          (method === SignInMethodKey.Email && email) ||
          (method === SignInMethodKey.Sms && sms) ||
          (method === SignInMethodKey.Social && social);

        return (
          <div key={method} className={styles.method}>
            <Controller
              name={`signInMethods.${method}`}
              control={control}
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  label={label}
                  disabled={primaryMethod === method}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            {enabled && <ConnectorSetupWarning method={method} />}
          </div>
        );
      }),
    [t, primaryMethod, email, sms, social, control]
  );

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.sign_in_methods.title')}</div>
      <FormField title="sign_in_exp.sign_in_methods.primary">
        <Controller
          name="signInMethods.primary"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select
              value={value}
              options={signInMethods.map((method) => ({
                value: method,
                title: t('sign_in_exp.sign_in_methods.methods', { context: method }),
              }))}
              onChange={(value) => {
                const oldPrimaryMethod = getValues('signInMethods.primary');
                onChange(value);
                postPrimaryMethodChange(oldPrimaryMethod, value);
              }}
            />
          )}
        />
      </FormField>
      {primaryMethod && <ConnectorSetupWarning method={primaryMethod} />}
      {primaryMethod === SignInMethodKey.Social && (
        <div className={styles.primarySocial}>
          <Controller
            name="socialSignInConnectorTargets"
            control={control}
            render={({ field: { value, onChange } }) => (
              <ConnectorsTransfer value={value} onChange={onChange} />
            )}
          />
        </div>
      )}
      <FormField title="sign_in_exp.sign_in_methods.enable_secondary">
        <Switch
          /**
           * DO NOT SET THIS FIELD TO REQUIRED UNLESS YOU KNOW WHAT YOU ARE DOING.
           * https://github.com/react-hook-form/react-hook-form/issues/2323
           */
          {...register('signInMethods.enableSecondary')}
          label={t('sign_in_exp.sign_in_methods.enable_secondary_description')}
        />
      </FormField>
      {enableSecondary && (
        <>
          {secondaryMethodsFields}
          {social && (
            <FormField title="sign_in_exp.sign_in_methods.define_social_methods">
              <Controller
                name="socialSignInConnectorTargets"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <ConnectorsTransfer value={value} onChange={onChange} />
                )}
              />
            </FormField>
          )}
        </>
      )}
    </>
  );
};

export default SignInMethodsForm;
