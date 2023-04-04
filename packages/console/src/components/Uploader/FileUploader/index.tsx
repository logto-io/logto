import type { AllowedUploadMimeType, UserAssets } from '@logto/schemas';
import { maxUploadFileSize } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { type FileRejection, useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import UploaderIcon from '@/assets/images/upload.svg';
import useApi from '@/hooks/use-api';
import { convertToFileExtensionArray } from '@/utils/uploader';

import { Ring } from '../../Spinner';

import * as styles from './index.module.scss';

export type Props = {
  maxSize: number; // In bytes
  allowedMimeTypes: AllowedUploadMimeType[];
  actionDescription?: string;
  onCompleted: (fileUrl: string) => void;
  onUploadErrorChange: (errorMessage?: string) => void;
};

function FileUploader({
  maxSize,
  allowedMimeTypes,
  actionDescription,
  onCompleted,
  onUploadErrorChange,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();

  useEffect(() => {
    onUploadErrorChange(uploadError);

    return () => {
      onUploadErrorChange(undefined);
    };
  }, [onUploadErrorChange, uploadError]);

  const api = useApi();

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejection: FileRejection[]) => {
      setUploadError(undefined);

      const rejectedFile = fileRejection[0]?.file;

      if (rejectedFile) {
        if (!allowedMimeTypes.map(String).includes(rejectedFile.type)) {
          setUploadError(
            t('components.uploader.error_file_type', {
              extensions: convertToFileExtensionArray(allowedMimeTypes),
            })
          );
        }

        return;
      }

      const acceptedFile = acceptedFiles[0];

      if (!acceptedFile) {
        return;
      }

      const fileSizeLimit = Math.min(maxSize, maxUploadFileSize);

      if (acceptedFile.size > fileSizeLimit) {
        setUploadError(t('components.uploader.error_file_size', { size: fileSizeLimit / 1024 }));

        return;
      }

      const formData = new FormData();
      formData.append('file', acceptedFile);

      try {
        setIsUploading(true);
        const { url } = await api.post('api/user-assets', { body: formData }).json<UserAssets>();

        onCompleted(url);
      } catch {
        setUploadError(t('components.uploader.error_upload'));
      } finally {
        setIsUploading(false);
      }
    },
    [allowedMimeTypes, api, maxSize, onCompleted, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    multiple: false,
    accept: Object.fromEntries(allowedMimeTypes.map((mimeType) => [mimeType, []])),
  });

  return (
    <div
      {...getRootProps()}
      className={classNames(
        styles.uploader,
        Boolean(uploadError) && styles.uploaderError,
        isDragActive && styles.dragActive
      )}
    >
      <input {...getInputProps()} />
      <div className={styles.placeholder}>
        {isUploading ? (
          <>
            <Ring className={styles.uploadingIcon} />
            <div className={styles.actionDescription}>{t('components.uploader.uploading')}</div>
          </>
        ) : (
          <>
            <UploaderIcon className={styles.icon} />
            <div className={styles.actionDescription}>
              {actionDescription ?? t('components.uploader.action_description')}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FileUploader;
