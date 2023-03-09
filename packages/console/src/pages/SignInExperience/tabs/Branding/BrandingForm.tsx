import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/components/Card';
import FormField from '@/components/FormField';
import TextInput from '@/components/TextInput';
import { uriValidator } from '@/utils/validator';

import type { SignInExperienceForm } from '../../types';
import * as styles from '../index.module.scss';

const BrandingForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    watch,
    register,
    formState: { errors },
  } = useFormContext<SignInExperienceForm>();

  const isDarkModeEnabled = watch('color.isDarkModeEnabled');

  return (
    <Card>
      <div className={styles.title}>{t('sign_in_exp.branding.title')}</div>

      <FormField title="sign_in_exp.branding.favicon">
        <TextInput
          {...register('branding.favicon', {
            validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
          })}
          hasError={Boolean(errors.branding?.favicon)}
          errorMessage={errors.branding?.favicon?.message}
          placeholder={t('sign_in_exp.branding.favicon')}
        />
      </FormField>
      <FormField title="sign_in_exp.branding.logo_image_url">
        <TextInput
          {...register('branding.logoUrl', {
            validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
          })}
          hasError={Boolean(errors.branding?.logoUrl)}
          errorMessage={errors.branding?.logoUrl?.message}
          placeholder={t('sign_in_exp.branding.logo_image_url_placeholder')}
        />
      </FormField>
      {isDarkModeEnabled && (
        <FormField title="sign_in_exp.branding.dark_logo_image_url">
          <TextInput
            {...register('branding.darkLogoUrl', {
              validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
            })}
            hasError={Boolean(errors.branding?.darkLogoUrl)}
            errorMessage={errors.branding?.darkLogoUrl?.message}
            placeholder={t('sign_in_exp.branding.dark_logo_image_url_placeholder')}
          />
        </FormField>
      )}
    </Card>
  );
};

export default BrandingForm;
