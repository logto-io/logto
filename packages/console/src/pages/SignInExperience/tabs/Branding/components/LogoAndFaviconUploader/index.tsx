import classNames from 'classnames';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ImageUploader, {
  allowedImageMimeTypes,
  maxImageSizeLimit,
} from '@/components/Uploader/ImageUploader';
import type { SignInExperienceForm } from '@/pages/SignInExperience/types';
import { convertToFileExtensionArray } from '@/utils/uploader';

import * as styles from './index.module.scss';

const LogoAndFaviconUploader = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [uploadLogoError, setUploadLogoError] = useState<string>();
  const [uploadFaviconError, setUploadFaviconError] = useState<string>();

  const { control } = useFormContext<SignInExperienceForm>();

  return (
    <div className={styles.container}>
      <div className={styles.uploader}>
        <div className={styles.logoUploader}>
          <Controller
            control={control}
            name="branding.logoUrl"
            render={({ field: { onChange, value, name } }) => (
              <ImageUploader
                name={name}
                value={value ?? ''}
                actionDescription={t('sign_in_exp.branding.logo_image')}
                onCompleted={onChange}
                onUploadErrorChange={setUploadLogoError}
                onDelete={() => {
                  onChange('');
                }}
              />
            )}
          />
        </div>
        <div className={styles.faviconUploader}>
          <Controller
            control={control}
            name="branding.favicon"
            render={({ field: { onChange, value, name } }) => (
              <ImageUploader
                name={name}
                value={value ?? ''}
                actionDescription={t('sign_in_exp.branding.favicon')}
                onCompleted={onChange}
                onUploadErrorChange={setUploadFaviconError}
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
          {t('sign_in_exp.branding.logo_image_error', { error: uploadLogoError })}
        </div>
      )}
      {uploadFaviconError && (
        <div className={classNames(styles.description, styles.error)}>
          {t('sign_in_exp.branding.favicon_error', { error: uploadFaviconError })}
        </div>
      )}
      <div className={styles.description}>
        {t('components.uploader.image_limit', {
          size: maxImageSizeLimit / 1024,
          extensions: convertToFileExtensionArray(allowedImageMimeTypes),
        })}
      </div>
    </div>
  );
};

export default LogoAndFaviconUploader;
