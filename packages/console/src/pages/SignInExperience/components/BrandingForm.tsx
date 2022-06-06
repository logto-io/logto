import { BrandingStyle } from '@logto/schemas';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ColorPicker from '@/components/ColorPicker';
import FormField from '@/components/FormField';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import Switch from '@/components/Switch';
import TextInput from '@/components/TextInput';
import { uriValidator } from '@/utilities/validator';

import { SignInExperienceForm } from '../types';
import * as styles from './index.module.scss';

const BrandingForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    watch,
    register,
    control,
    formState: { errors },
  } = useFormContext<SignInExperienceForm>();

  const isDarkModeEnabled = watch('branding.isDarkModeEnabled');
  const style = watch('branding.style');
  const isSloganRequired = style === BrandingStyle.Logo_Slogan;

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.branding.title')}</div>
      <FormField title="admin_console.sign_in_exp.branding.primary_color">
        <Controller
          name="branding.primaryColor"
          control={control}
          render={({ field: { onChange, value } }) => (
            <ColorPicker value={value} onChange={onChange} />
          )}
        />
      </FormField>
      <FormField title="admin_console.sign_in_exp.branding.dark_mode">
        <Switch
          label={t('sign_in_exp.branding.dark_mode_description')}
          {...register('branding.isDarkModeEnabled')}
        />
      </FormField>
      {isDarkModeEnabled && (
        <FormField title="admin_console.sign_in_exp.branding.dark_primary_color">
          <Controller
            name="branding.darkPrimaryColor"
            control={control}
            render={({ field: { onChange, value } }) => (
              <ColorPicker value={value} onChange={onChange} />
            )}
          />
        </FormField>
      )}
      <FormField title="admin_console.sign_in_exp.branding.ui_style">
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
        <TextInput
          {...register('branding.logoUrl', {
            required: true,
            validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
          })}
          hasError={Boolean(errors.branding?.logoUrl)}
          errorMessage={errors.branding?.logoUrl?.message}
        />
      </FormField>
      {isDarkModeEnabled && (
        <FormField title="admin_console.sign_in_exp.branding.dark_logo_image_url">
          <TextInput
            {...register('branding.darkLogoUrl', {
              validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
            })}
            hasError={Boolean(errors.branding?.darkLogoUrl)}
            errorMessage={errors.branding?.darkLogoUrl?.message}
          />
        </FormField>
      )}
      <FormField isRequired={isSloganRequired} title="admin_console.sign_in_exp.branding.slogan">
        <TextInput
          {...register('branding.slogan', { required: isSloganRequired })}
          hasError={Boolean(errors.branding?.slogan)}
        />
      </FormField>
    </>
  );
};

export default BrandingForm;
