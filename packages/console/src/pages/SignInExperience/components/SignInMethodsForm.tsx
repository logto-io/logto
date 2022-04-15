import { SignInMethodKey } from '@logto/schemas';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';
import Select from '@/components/Select';
import Switch from '@/components/Switch';

import { SignInExperienceForm } from '../types';
import * as styles from './index.module.scss';

const signInMethods = Object.values(SignInMethodKey);

const SignInMethodsForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { register, watch, control } = useFormContext<SignInExperienceForm>();
  const primaryMethod = watch('signInMethods.primary');

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
      <FormField isRequired title="admin_console.sign_in_exp.sign_in_methods.enable_secondary">
        <Switch
          {...register('signInMethods.enableSecondary', { required: true })}
          label={t('sign_in_exp.sign_in_methods.enable_secondary_description')}
        />
        {signInMethods.map((method) => (
          <div key={method}>
            {/* TODO: LOG-2187 checkbox component */}
            <input
              type="checkbox"
              id={method}
              value={method}
              disabled={primaryMethod === method}
              {...register(`signInMethods.${method}`)}
            />
            <label htmlFor={method}>
              {t('sign_in_exp.sign_in_methods.methods', { context: method })}
              {primaryMethod === method && (
                <span className={styles.primaryTag}>
                  {t('sign_in_exp.sign_in_methods.methods_primary_tag')}
                </span>
              )}
            </label>
          </div>
        ))}
      </FormField>
      <FormField title="admin_console.sign_in_exp.sign_in_methods.define_social_methods">
        {/* TODO: LOG-1735 transfer component */}
        <input {...register('socialSignInConnectorIds')} />
      </FormField>
    </>
  );
};

export default SignInMethodsForm;
