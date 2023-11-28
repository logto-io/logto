import type { AllowedUploadMimeType } from '@logto/schemas';
import classNames from 'classnames';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ImageUploader from '@/ds-components/Uploader/ImageUploader';
import useImageMimeTypes from '@/hooks/use-image-mime-types';

import type { FormType } from '../index.js';

import * as styles from './index.module.scss';

const allowedMimeTypes: AllowedUploadMimeType[] = ['image/png', 'image/jpeg', 'image/svg+xml']; // Only allow `svg`, `png`, `jpg` and `jpeg` files.

function LogosUploader() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [uploadLogoError, setUploadLogoError] = useState<string>();
  const [uploadDarkLogoError, setUploadDarkLogoError] = useState<string>();

  const { control } = useFormContext<FormType>();
  const { description } = useImageMimeTypes(allowedMimeTypes);

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
                className={styles.frame}
                value={value ?? ''}
                actionDescription={t('enterprise_sso_details.branding_logo_context')}
                allowedMimeTypes={allowedMimeTypes}
                onCompleted={onChange}
                onUploadErrorChange={setUploadLogoError}
                onDelete={() => {
                  onChange('');
                }}
              />
            )}
          />
        </div>
        <div className={styles.logoDarkUploader}>
          <Controller
            control={control}
            name="branding.darkLogo"
            render={({ field: { onChange, value, name } }) => (
              <ImageUploader
                name={name}
                className={styles.frameDark}
                value={value ?? ''}
                actionDescription={t('enterprise_sso_details.branding_dark_logo_context')}
                allowedMimeTypes={allowedMimeTypes}
                onCompleted={onChange}
                onUploadErrorChange={setUploadDarkLogoError}
                onDelete={() => {
                  onChange('');
                }}
              />
            )}
          />
        </div>
      </div>
      {uploadLogoError && (
        <div className={classNames(styles.description, styles.error)}>
          {t('enterprise_sso_details.branding_logo_error', { error: uploadLogoError })}
        </div>
      )}
      {uploadDarkLogoError && (
        <div className={classNames(styles.description, styles.error)}>
          {t('enterprise_sso_details.branding_dark_logo_error', { error: uploadDarkLogoError })}
        </div>
      )}
      <div className={styles.description}>{description}</div>
    </div>
  );
}

export default LogosUploader;
