import { SignInMethodKey } from '@logto/schemas';
import React, { useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Checkbox from '@/components/Checkbox';
import FormField from '@/components/FormField';
import Select from '@/components/Select';
import Switch from '@/components/Switch';

import { SignInExperienceForm } from '../types';
import ConnectorsTransfer from './ConnectorsTransfer';
import * as styles from './index.module.scss';

const signInMethods = Object.values(SignInMethodKey);

const SignInMethodsForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { register, watch, control, setValue } = useFormContext<SignInExperienceForm>();
  const primaryMethod = watch('signInMethods.primary');
  const enableSecondary = watch('signInMethods.enableSecondary');
  const social = watch('signInMethods.social');

  useEffect(() => {
    if (primaryMethod) {
      // When one of the sign-in methods has been primary, it should not be able to be secondary simultaneously.
      setValue(`signInMethods.${primaryMethod}`, false);
    }
  }, [primaryMethod, setValue]);

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

        return (
          <div key={method} className={styles.method}>
            <Checkbox
              label={label}
              disabled={primaryMethod === method}
              {...register(`signInMethods.${method}`)}
            />
          </div>
        );
      }),
    [primaryMethod, register, t]
  );

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.sign_in_methods.title')}</div>
      <FormField isRequired title="admin_console.sign_in_exp.sign_in_methods.primary">
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
              onChange={onChange}
            />
          )}
        />
      </FormField>
      {primaryMethod === SignInMethodKey.Social && (
        <div className={styles.primarySocial}>
          <Controller
            name="socialSignInConnectorIds"
            control={control}
            render={({ field: { value, onChange } }) => (
              <ConnectorsTransfer value={value} onChange={onChange} />
            )}
          />
        </div>
      )}
      <FormField isRequired title="admin_console.sign_in_exp.sign_in_methods.enable_secondary">
        <Switch
          {...register('signInMethods.enableSecondary', { required: true })}
          label={t('sign_in_exp.sign_in_methods.enable_secondary_description')}
        />
      </FormField>
      {enableSecondary && (
        <>
          {secondaryMethodsFields}
          {social && (
            <FormField title="admin_console.sign_in_exp.sign_in_methods.define_social_methods">
              <Controller
                name="socialSignInConnectorIds"
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
