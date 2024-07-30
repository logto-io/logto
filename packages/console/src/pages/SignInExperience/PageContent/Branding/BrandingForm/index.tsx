import { generateDarkColor } from '@logto/core-kit';
import { Theme } from '@logto/schemas';
import { useMemo, useCallback, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import LogoAndFavicon from '@/components/ImageInputs/LogoAndFavicon';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import ColorPicker from '@/ds-components/ColorPicker';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';

import type { SignInExperienceForm } from '../../../types';
import FormSectionTitle from '../../components/FormSectionTitle';

import styles from './index.module.scss';

function BrandingForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    watch,
    register,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useFormContext<SignInExperienceForm>();

  const isDarkModeEnabled = watch('color.isDarkModeEnabled');
  const primaryColor = watch('color.primaryColor');
  const darkPrimaryColor = watch('color.darkPrimaryColor');

  const calculatedDarkPrimaryColor = useMemo(() => {
    return generateDarkColor(primaryColor);
  }, [primaryColor]);

  const handleResetColor = useCallback(() => {
    setValue('color.darkPrimaryColor', calculatedDarkPrimaryColor, { shouldDirty: true });
  }, [calculatedDarkPrimaryColor, setValue]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    // If it's enabled, the original dark mode color won't change, users need to click "reset".
    if (!isDarkModeEnabled) {
      handleResetColor();
    }
  }, [handleResetColor, isDarkModeEnabled, isDirty]);

  return (
    <Card>
      <FormSectionTitle title="branding.title" />
      <FormField title="sign_in_exp.color.primary_color">
        <Controller
          name="color.primaryColor"
          control={control}
          render={({ field: { name, onChange, value } }) => (
            <ColorPicker name={name} value={value} onChange={onChange} />
          )}
        />
      </FormField>
      <LogoAndFavicon
        control={control}
        register={register}
        theme={Theme.Light}
        type="company_logo"
        logo={{ name: 'branding.logoUrl', error: errors.branding?.logoUrl }}
        favicon={{
          name: 'branding.favicon',
          error: errors.branding?.favicon,
        }}
      />
      <FormField title="sign_in_exp.color.dark_mode">
        <Switch
          label={t('sign_in_exp.color.dark_mode_description')}
          {...register('color.isDarkModeEnabled')}
        />
      </FormField>
      {isDarkModeEnabled && (
        <>
          <FormField title="sign_in_exp.color.dark_primary_color">
            <Controller
              name="color.darkPrimaryColor"
              control={control}
              render={({ field: { onChange, value } }) => (
                <ColorPicker value={value} onChange={onChange} />
              )}
            />
            {calculatedDarkPrimaryColor !== darkPrimaryColor && (
              <div className={styles.darkModeTip}>
                {t('sign_in_exp.color.dark_mode_reset_tip')}
                <Button
                  type="text"
                  size="small"
                  title="sign_in_exp.color.reset"
                  onClick={handleResetColor}
                />
              </div>
            )}
          </FormField>
          <LogoAndFavicon
            control={control}
            register={register}
            theme={Theme.Dark}
            type="company_logo"
            logo={{ name: 'branding.darkLogoUrl', error: errors.branding?.darkLogoUrl }}
            favicon={{
              name: 'branding.darkFavicon',
              error: errors.branding?.darkFavicon,
            }}
          />
        </>
      )}
    </Card>
  );
}

export default BrandingForm;
