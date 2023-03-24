import { generateDarkColor } from '@logto/core-kit';
import { useMemo, useCallback, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import Card from '@/components/Card';
import ColorPicker from '@/components/ColorPicker';
import DangerousRaw from '@/components/DangerousRaw';
import FormField from '@/components/FormField';
import Switch from '@/components/Switch';
import TextInput from '@/components/TextInput';
import { ImageUploaderField } from '@/components/Uploader';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import { uriValidator } from '@/utils/validator';

import LogoAndFaviconUploader from './components/LogoAndFaviconUploader';
import type { SignInExperienceForm } from '../../types';
import * as styles from '../index.module.scss';

function BrandingForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isReady: isUserAssetsServiceReady } = useUserAssetsService();
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
    setValue('color.darkPrimaryColor', calculatedDarkPrimaryColor);
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
      <div className={styles.title}>{t('sign_in_exp.branding.title')}</div>
      <FormField title="sign_in_exp.color.primary_color">
        <Controller
          name="color.primaryColor"
          control={control}
          render={({ field: { onChange, value } }) => (
            <ColorPicker value={value} onChange={onChange} />
          )}
        />
      </FormField>
      {isUserAssetsServiceReady ? (
        <FormField
          title={
            <DangerousRaw>
              {t('sign_in_exp.branding.logo_image')}
              {' & '}
              {t('sign_in_exp.branding.favicon')}
            </DangerousRaw>
          }
          headlineClassName={styles.imageFieldHeadline}
        >
          <LogoAndFaviconUploader />
        </FormField>
      ) : (
        <>
          <FormField title="sign_in_exp.branding.logo_image_url">
            <TextInput
              {...register('branding.logoUrl', {
                validate: (value) =>
                  !value || uriValidator(value) || t('errors.invalid_uri_format'),
              })}
              hasError={Boolean(errors.branding?.logoUrl)}
              errorMessage={errors.branding?.logoUrl?.message}
              placeholder={t('sign_in_exp.branding.logo_image_url_placeholder')}
            />
          </FormField>
          <FormField title="sign_in_exp.branding.favicon">
            <TextInput
              {...register('branding.favicon', {
                validate: (value) =>
                  !value || uriValidator(value) || t('errors.invalid_uri_format'),
              })}
              hasError={Boolean(errors.branding?.favicon)}
              errorMessage={errors.branding?.favicon?.message}
              placeholder={t('sign_in_exp.branding.favicon')}
            />
          </FormField>
        </>
      )}
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
          {isUserAssetsServiceReady ? (
            <FormField
              title="sign_in_exp.branding.dark_logo_image"
              headlineClassName={styles.imageFieldHeadline}
            >
              <Controller
                name="branding.darkLogoUrl"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <ImageUploaderField
                    name={name}
                    value={value ?? ''}
                    actionDescription={t('sign_in_exp.branding.dark_logo_image')}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
          ) : (
            <FormField title="sign_in_exp.branding.dark_logo_image_url">
              <TextInput
                {...register('branding.darkLogoUrl', {
                  validate: (value) =>
                    !value || uriValidator(value) || t('errors.invalid_uri_format'),
                })}
                hasError={Boolean(errors.branding?.darkLogoUrl)}
                errorMessage={errors.branding?.darkLogoUrl?.message}
                placeholder={t('sign_in_exp.branding.dark_logo_image_url_placeholder')}
              />
            </FormField>
          )}
        </>
      )}
    </Card>
  );
}

export default BrandingForm;
