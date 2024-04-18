import { type ApplicationSignInExperience } from '@logto/schemas';
import classNames from 'classnames';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ImageUploader from '@/ds-components/Uploader/ImageUploader';
import useImageMimeTypes from '@/hooks/use-image-mime-types';

import * as styles from './LogoUploader.module.scss';

type Props = {
  readonly isDarkModeEnabled?: boolean;
};

function LogoUploader({ isDarkModeEnabled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [uploadLogoError, setUploadLogoError] = useState<string>();
  const [uploadDarkLogoError, setUploadDarkLogoError] = useState<string>();
  const { description } = useImageMimeTypes();
  const { control } = useFormContext<ApplicationSignInExperience>();

  return (
    <div>
      <div className={styles.container}>
        <Controller
          name="branding.logoUrl"
          control={control}
          render={({ field: { onChange, value, name } }) => (
            <ImageUploader
              className={isDarkModeEnabled ? styles.multiColumn : undefined}
              name={name}
              value={value ?? ''}
              actionDescription={t('sign_in_exp.branding.logo_image_url')}
              onCompleted={onChange}
              onUploadErrorChange={setUploadLogoError}
              onDelete={() => {
                onChange('');
              }}
            />
          )}
        />
        {/* Show the dark mode logto uploader only if dark mode is enabled in the global sign-in-experience */}
        {isDarkModeEnabled && (
          <Controller
            name="branding.darkLogoUrl"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <ImageUploader
                name={name}
                value={value ?? ''}
                className={value ? styles.darkMode : undefined}
                actionDescription={t('sign_in_exp.branding.dark_logo_image_url')}
                onCompleted={onChange}
                onUploadErrorChange={setUploadDarkLogoError}
                onDelete={() => {
                  onChange('');
                }}
              />
            )}
          />
        )}
      </div>
      {uploadLogoError && (
        <div className={classNames(styles.description, styles.error)}>
          {t('sign_in_exp.branding.logo_image_error', { error: uploadLogoError })}
        </div>
      )}
      {uploadDarkLogoError && (
        <div className={classNames(styles.description, styles.error)}>
          {t('sign_in_exp.branding.logo_image_error', { error: uploadDarkLogoError })}
        </div>
      )}
      <div className={styles.description}>{description}</div>
    </div>
  );
}

export default LogoUploader;
