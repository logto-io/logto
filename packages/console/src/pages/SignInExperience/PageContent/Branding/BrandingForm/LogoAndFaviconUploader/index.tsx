import classNames from 'classnames';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ImageUploader from '@/ds-components/Uploader/ImageUploader';
import useImageMimeTypes from '@/hooks/use-image-mime-types';
import type { SignInExperienceForm } from '@/pages/SignInExperience/types';

import * as styles from './index.module.scss';

function LogoAndFaviconUploader() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [uploadLogoError, setUploadLogoError] = useState<string>();
  const [uploadFaviconError, setUploadFaviconError] = useState<string>();

  const { control } = useFormContext<SignInExperienceForm>();
  const { description } = useImageMimeTypes();

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
      <div className={styles.description}>{description}</div>
    </div>
  );
}

export default LogoAndFaviconUploader;
