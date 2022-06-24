import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ColorPicker from '@/components/ColorPicker';
import FormField from '@/components/FormField';
import Switch from '@/components/Switch';

import { SignInExperienceForm } from '../types';
import * as styles from './index.module.scss';

const ColorForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { watch, register, control } = useFormContext<SignInExperienceForm>();

  const isDarkModeEnabled = watch('color.isDarkModeEnabled');

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.color.title')}</div>
      <FormField title="admin_console.sign_in_exp.color.primary_color">
        <Controller
          name="color.primaryColor"
          control={control}
          render={({ field: { onChange, value } }) => (
            <ColorPicker value={value} onChange={onChange} />
          )}
        />
      </FormField>
      <FormField title="admin_console.sign_in_exp.color.dark_mode">
        <Switch
          label={t('sign_in_exp.color.dark_mode_description')}
          {...register('color.isDarkModeEnabled')}
        />
      </FormField>
      {isDarkModeEnabled && (
        <FormField title="admin_console.sign_in_exp.color.dark_primary_color">
          <Controller
            name="color.darkPrimaryColor"
            control={control}
            render={({ field: { onChange, value } }) => (
              <ColorPicker value={value} onChange={onChange} />
            )}
          />
        </FormField>
      )}
    </>
  );
};

export default ColorForm;
