import type { UserAssetsResponse, AllowedUploadMimeType } from '@logto/schemas';
import { maxUploadFileSize } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import UploaderIcon from '@/assets/images/upload.svg';
import useApi from '@/hooks/use-api';

import { Ring } from '../Spinner';
import * as styles from './index.module.scss';

const allowedFileCount = 1;

type Props = {
  maxSize: number; // In bytes
  allowedMimeTypes: AllowedUploadMimeType[];
  limitDescription: string;
  onCompleted: (fileUrl: string) => void;
};

const FileUploader = ({ maxSize, allowedMimeTypes, limitDescription, onCompleted }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isUploading, setIsUploading] = useState(false);
  const [uploaderError, setUploaderError] = useState<string>();
  const hasError = Boolean(uploaderError);

  const api = useApi();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploaderError(undefined);

      if (acceptedFiles.length > allowedFileCount) {
        setUploaderError(t('components.uploader.error_file_count', { count: allowedFileCount }));

        return;
      }

      const selectedFile = acceptedFiles[0];

      if (!selectedFile) {
        return;
      }

      if (!allowedMimeTypes.map(String).includes(selectedFile.type)) {
        const supportedFileTypes = allowedMimeTypes.map((type) =>
          type.split('/')[1]?.toUpperCase()
        );
        setUploaderError(t('components.uploader.error_file_type', { types: supportedFileTypes }));

        return;
      }

      const fileSizeLimit = Math.min(maxSize, maxUploadFileSize);

      if (selectedFile.size > fileSizeLimit) {
        setUploaderError(t('components.uploader.error_file_size', { count: fileSizeLimit / 1024 }));

        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        setIsUploading(true);
        const { url } = await api
          .post('api/user-assets', { body: formData })
          .json<UserAssetsResponse>();

        onCompleted(url);
      } catch {
        setUploaderError(t('components.uploader.error_upload'));
      } finally {
        setIsUploading(false);
      }
    },
    [allowedMimeTypes, api, maxSize, onCompleted, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={classNames(
          styles.uploader,
          uploaderError && styles.uploaderError,
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
                {t('components.uploader.action_description')}
              </div>
            </>
          )}
        </div>
      </div>
      <div className={classNames(styles.description, hasError && styles.error)}>
        {hasError ? uploaderError : limitDescription}
      </div>
    </div>
  );
};

export default FileUploader;
