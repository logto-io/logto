import type { AllowedUploadMimeType } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Delete from '@/assets/images/delete.svg';
import { convertToFileExtensionArray } from '@/utils/uploader';

import FileUploader from '../FileUploader';
import IconButton from '../IconButton';
import * as styles from './index.module.scss';

type Props = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  isHideStateInfo?: boolean;
  actionDescription?: string;
  onError?: (errorMessage?: string) => void;
};

export const maxImageSizeLimit = 500 * 1024; // 500 KB

export const allowedImageMimeTypes: AllowedUploadMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const ImageUploader = ({
  name,
  value,
  onChange,
  isHideStateInfo = false,
  actionDescription,
  onError,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const limitDescription = t('components.uploader.image_limit', {
    size: maxImageSizeLimit / 1024,
    extensions: convertToFileExtensionArray(allowedImageMimeTypes),
  });

  const [error, setError] = useState<string>();

  const handleError = useCallback(
    (errorMessage?: string) => {
      setError(errorMessage);
      onError?.(errorMessage);
    },
    [onError]
  );

  useEffect(() => {
    if (value) {
      handleError(undefined);
    }
  }, [handleError, value]);

  if (!value) {
    return (
      <div>
        <FileUploader
          allowedMimeTypes={allowedImageMimeTypes}
          maxSize={maxImageSizeLimit}
          hasError={Boolean(error)}
          actionDescription={actionDescription}
          onCompleted={onChange}
          onError={handleError}
        />
        {!isHideStateInfo && (
          <div className={classNames(styles.limit, Boolean(error) && styles.error)}>
            {error ?? limitDescription}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className={styles.imageUploader}>
        <img alt={name} src={value} />
        <IconButton
          className={styles.delete}
          onClick={() => {
            onChange('');
          }}
        >
          <Delete />
        </IconButton>
      </div>
      {!isHideStateInfo && <div className={styles.limit}>{limitDescription}</div>}
    </div>
  );
};

export default ImageUploader;
