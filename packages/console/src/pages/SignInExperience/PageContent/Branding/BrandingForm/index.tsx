import { generateDarkColor } from '@logto/core-kit';
import { useMemo, useCallback, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import ColorPicker from '@/ds-components/ColorPicker';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';
import ImageUploaderField from '@/ds-components/Uploader/ImageUploaderField';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import { uriValidator } from '@/utils/validator';

import type { SignInExperienceForm } from '../../../types';
import FormSectionTitle from '../../components/FormSectionTitle';

import LogoAndFaviconUploader from './LogoAndFaviconUploader';
import * as styles from './index.module.scss';

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
      <FormSectionTitle title="branding.title" />
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
          headlineSpacing="large"
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
              error={errors.branding?.logoUrl?.message}
              placeholder={t('sign_in_exp.branding.logo_image_url_placeholder')}
            />
          </FormField>
          <FormField title="sign_in_exp.branding.favicon">
            <TextInput
              {...register('branding.favicon', {
                validate: (value) =>
                  !value || uriValidator(value) || t('errors.invalid_uri_format'),
              })}
              error={errors.branding?.favicon?.message}
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
            <FormField title="sign_in_exp.branding.dark_logo_image" headlineSpacing="large">
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
                error={errors.branding?.darkLogoUrl?.message}
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
