import type { AllowedUploadMimeType } from '@logto/schemas';
import classNames from 'classnames';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ImageUploader from '@/ds-components/Uploader/ImageUploader';

import type { FormType } from '../index.js';

import styles from './index.module.scss';

const allowedMimeTypes: AllowedUploadMimeType[] = ['image/png', 'image/jpeg', 'image/svg+xml']; // Only allow `svg`, `png`, `jpg` and `jpeg` files.

type Props = {
  readonly isDarkModeEnabled: boolean;
};

function LogosUploader({ isDarkModeEnabled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [uploadLogoError, setUploadLogoError] = useState<string>();
  const [uploadDarkLogoError, setUploadDarkLogoError] = useState<string>();

  const { control } = useFormContext<FormType>();

  return (
    <div className={styles.container}>
      <div className={styles.uploader}>
        <div className={styles.logoUploader}>
          <Controller
            control={control}
            name="branding.logo"
            render={({ field: { onChange, value, name } }) => (
              <ImageUploader
                name={name}
                className={classNames(
                  isDarkModeEnabled && styles.frame,
                  isDarkModeEnabled && value && styles.frameBackground
                )}
                value={value ?? ''}
                actionDescription={t(
                  isDarkModeEnabled
                    ? 'enterprise_sso_details.branding_light_logo_context'
                    : 'enterprise_sso_details.branding_logo_context'
                )}
                allowedMimeTypes={allowedMimeTypes}
                onUploadComplete={({ url }) => {
                  onChange(url);
                }}
                onUploadErrorChange={setUploadLogoError}
                onDelete={() => {
                  onChange('');
                }}
              />
            )}
          />
        </div>
        {isDarkModeEnabled && (
          <div className={styles.logoDarkUploader}>
            <Controller
              control={control}
              name="branding.darkLogo"
              render={({ field: { onChange, value, name } }) => (
                <ImageUploader
                  name={name}
                  className={classNames(styles.frameDark, value && styles.frameDarkBackground)}
                  value={value ?? ''}
                  actionDescription={t('enterprise_sso_details.branding_dark_logo_context')}
                  allowedMimeTypes={allowedMimeTypes}
                  onUploadComplete={({ url }) => {
                    onChange(url);
                  }}
                  onUploadErrorChange={setUploadDarkLogoError}
                  onDelete={() => {
                    onChange('');
                  }}
                />
              )}
            />
          </div>
        )}
      </div>
      {uploadLogoError && (
        <div className={classNames(styles.description, styles.error)}>
          {t(
            isDarkModeEnabled
              ? 'enterprise_sso_details.branding_light_logo_error'
              : 'enterprise_sso_details.branding_logo_error',
            { error: uploadLogoError }
          )}
        </div>
      )}
      {uploadDarkLogoError && (
        <div className={classNames(styles.description, styles.error)}>
          {t('enterprise_sso_details.branding_dark_logo_error', { error: uploadDarkLogoError })}
        </div>
      )}
      <div className={styles.description}>
        {t('enterprise_sso_details.connector_logo_field_description')}
      </div>
    </div>
  );
}

export default LogosUploader;
