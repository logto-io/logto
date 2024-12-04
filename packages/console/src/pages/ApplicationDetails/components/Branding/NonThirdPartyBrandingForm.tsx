import { generateDarkColor } from '@logto/core-kit';
import { Theme } from '@logto/schemas';
import { useMemo, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import LogoAndFavicon from '@/components/ImageInputs/LogoAndFavicon';
import Button from '@/ds-components/Button';
import ColorPicker from '@/ds-components/ColorPicker';
import FormField from '@/ds-components/FormField';

import styles from './index.module.scss';
import { type ApplicationSignInExperienceForm } from './utils';

function NonThirdPartyBrandingForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<ApplicationSignInExperienceForm>();

  const [primaryColor, darkPrimaryColor] = watch(['color.primaryColor', 'color.darkPrimaryColor']);

  const calculatedDarkPrimaryColor = useMemo(() => {
    return primaryColor && generateDarkColor(primaryColor);
  }, [primaryColor]);

  const handleResetColor = useCallback(() => {
    setValue('color.darkPrimaryColor', calculatedDarkPrimaryColor, { shouldDirty: true });
  }, [calculatedDarkPrimaryColor, setValue]);

  return (
    <>
      <LogoAndFavicon
        control={control}
        register={register}
        theme={Theme.Light}
        type="app_logo"
        logo={{ name: 'branding.logoUrl', error: errors.branding?.logoUrl }}
        favicon={{
          name: 'branding.favicon',
          error: errors.branding?.favicon,
        }}
      />
      <LogoAndFavicon
        control={control}
        register={register}
        theme={Theme.Dark}
        type="app_logo"
        logo={{ name: 'branding.darkLogoUrl', error: errors.branding?.darkLogoUrl }}
        favicon={{
          name: 'branding.darkFavicon',
          error: errors.branding?.darkFavicon,
        }}
      />
      <div className={styles.colors}>
        <Controller
          control={control}
          name="color.primaryColor"
          render={({ field: { name, value, onChange } }) => (
            <FormField title="application_details.branding.brand_color">
              <ColorPicker name={name} value={value} onChange={onChange} />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="color.darkPrimaryColor"
          render={({ field: { name, value, onChange } }) => (
            <FormField title="application_details.branding.brand_color_dark">
              <ColorPicker name={name} value={value} onChange={onChange} />
            </FormField>
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
      </div>
    </>
  );
}

export default NonThirdPartyBrandingForm;
