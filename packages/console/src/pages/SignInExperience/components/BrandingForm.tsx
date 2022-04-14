import { BrandingStyle, SignInExperience } from '@logto/schemas';
import React from 'react';
import { Control, Controller, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import TextInput from '@/components/TextInput';

import * as styles from './index.module.scss';

type Props = {
  register: UseFormRegister<SignInExperience>;
  control: Control<SignInExperience>;
  watch: UseFormWatch<SignInExperience>;
};

const BrandingForm = ({ register, control, watch }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const isDarkModeEnabled = watch('branding.isDarkModeEnabled');
  const style = watch('branding.style');
  const isSloganRequired = style === BrandingStyle.Logo_Slogan;

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.branding.title')}</div>
      <FormField isRequired title="admin_console.sign_in_exp.branding.primary_color">
        {/* TODO: LOG-1733 color-picker */}
        <TextInput {...register('branding.primaryColor', { required: true })} />
      </FormField>
      <FormField isRequired title="admin_console.sign_in_exp.branding.dark_mode">
        {/* TODO: LOG-2152 switch */}
        <TextInput {...register('branding.isDarkModeEnabled', { required: true })} />
        <div>{t('sign_in_exp.branding.dark_mode_description')}</div>
      </FormField>
      <FormField
        isRequired={isDarkModeEnabled}
        title="admin_console.sign_in_exp.branding.dark_primary_color"
      >
        {/* TODO: LOG-1733 color-picker */}
        <TextInput {...register('branding.darkPrimaryColor', { required: isDarkModeEnabled })} />
      </FormField>
      <FormField isRequired title="admin_console.sign_in_exp.branding.ui_style">
        {/* TODO: LOG-2153 plain radio */}
        <Controller
          name="branding.style"
          control={control}
          defaultValue={BrandingStyle.Logo_Slogan}
          render={({ field: { onChange, value, name } }) => (
            <RadioGroup value={value} name={name} onChange={onChange}>
              <Radio
                value={BrandingStyle.Logo_Slogan}
                title="sign_in_exp.branding.styles.logo_slogan"
              />
              <Radio value={BrandingStyle.Logo} title="sign_in_exp.branding.styles.logo" />
            </RadioGroup>
          )}
        />
      </FormField>
      <FormField isRequired title="admin_console.sign_in_exp.branding.logo_image_url">
        <TextInput {...register('branding.logoUrl', { required: true })} />
      </FormField>
      <FormField isRequired={isSloganRequired} title="admin_console.sign_in_exp.branding.slogan">
        <TextInput {...register('branding.slogan', { required: isSloganRequired })} />
      </FormField>
    </>
  );
};

export default BrandingForm;
