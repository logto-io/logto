import { maxUploadFileSize } from '@logto/schemas';
import { HTTPError } from 'ky';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { uploadAvatar } from '@/apis/experience/avatar';
import UserAvatar from '@/assets/icons/default-user-avatar.svg?react';
import ErrorMessage from '@/shared/components/ErrorMessage';
import {
  avatarFileAccept,
  avatarFileExtensions,
  formatFileSizeLimit,
  validateAvatarFile,
} from '@/utils/avatar-upload';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly name: string;
  readonly label?: string;
  readonly description?: string;
  readonly isRequired?: boolean;
  readonly value?: string;
  readonly errorMessage?: string;
  readonly onBlur?: () => void;
  readonly onChange: (value: string) => void;
};

const AvatarUploadField = ({
  className,
  name,
  label,
  description,
  isRequired,
  value = '',
  errorMessage,
  onBlur,
  onChange,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'profile.avatar_upload' });
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const openFilePicker = useCallback(() => {
    if (isUploading) {
      return;
    }

    inputRef.current?.click();
  }, [isUploading]);

  const handleUploadError = useCallback(
    async (error: unknown) => {
      if (error instanceof HTTPError) {
        try {
          const { message } = await error.response.json<{ message: string }>();
          setUploadError(message);
          return;
        } catch {
          // Fall through to generic error message.
        }
      }

      setUploadError(t('error_upload'));
    },
    [t]
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const validationError = validateAvatarFile(file);

      if (validationError === 'file_size_exceeded') {
        setUploadError(t('error_file_size', { limit: formatFileSizeLimit(maxUploadFileSize) }));
        return;
      }

      if (validationError === 'file_type') {
        setUploadError(t('error_file_type', { extensions: avatarFileExtensions }));
        return;
      }

      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      abortControllerRef.current = abortController;

      setUploadError(undefined);
      setIsUploading(true);

      try {
        const { url } = await uploadAvatar(file, { signal: abortController.signal });
        onChange(url);
        onBlur?.();
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        await handleUploadError(error);
      } finally {
        if (!abortController.signal.aborted) {
          setIsUploading(false);
        }

        setFileInputKey((key) => key + 1);
      }
    },
    [handleUploadError, onBlur, onChange, t]
  );

  const handleRemove = useCallback(() => {
    setUploadError(undefined);
    onChange('');
    onBlur?.();
  }, [onBlur, onChange]);

  const displayError = uploadError ?? errorMessage;

  return (
    <div className={className}>
      <div className={styles.field}>
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label}
            {isRequired && ' *'}
          </label>
        )}
        {description && <div className={styles.description}>{description}</div>}
        <div className={styles.content}>
          {value ? (
            <img
              className={styles.avatar}
              src={value}
              alt={label ?? name}
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserAvatar className={styles.placeholder} />
          )}
          <input
            key={fileInputKey}
            ref={inputRef}
            id={inputId}
            className={styles.hiddenInput}
            type="file"
            name={name}
            accept={avatarFileAccept}
            onChange={handleFileChange}
          />
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.uploadButton}
              disabled={isUploading}
              onClick={openFilePicker}
            >
              {isUploading ? t('uploading') : value ? t('replace') : t('upload')}
            </button>
            {value && !isUploading && (
              <button type="button" className={styles.uploadButton} onClick={handleRemove}>
                {t('remove')}
              </button>
            )}
          </div>
        </div>
        {displayError && <ErrorMessage className={styles.description}>{displayError}</ErrorMessage>}
      </div>
    </div>
  );
};

export default AvatarUploadField;
